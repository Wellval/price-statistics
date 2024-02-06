app.post('/api/extract', upload.single('file'), async (req, res) => {
    logInfo('POST /api/extract',req.body);
    logInfo('FILE=',req.file);

    if (!req.body) {
        return res.status(500).json({ requestID: '', message: 'Missing required input (Form data)' });
    }

    const file = req.file;
    const { requestID, project, userID: idUser } = req.body;
    const user = await User.findOne(idUser);

    if (!requestID || !project || !idUser || !user) {
        return res.status(500).json({ requestID, message: 'Missing required input (requestID, project, userID)' });
    }

    logDebug('User with role ' + user.role, user);
    if (user.role === 'ADVISOR' || user.role.includes('ADVISOR')) {
        return res.json({requestID, step: 999, status: 'DONE', message: 'Nothing to do for ADVISOR role'});
    }

    /* reset status variables */
    await db.updateStatus(requestID, 1, '');

    const { projects } = config;

    logDebug('CONFIG:', projects);
    if (project === 'inkasso' && projects.hasOwnProperty(project) && file) {
        const { buffer, mimetype } = file;
        const hashSum = crypto.createHash('sha256');
        const fileHash = idUser;
        const fileName = 'fullmakt';
        const fileType = mime.getExtension(mimetype);
        if (fileType !== 'pdf') {
            return res.status(500).json({requestID, message: 'Missing pdf file'});
        }
        await db.updateStatus(requestID, 3, '');

        const folder = `${project}-signed/${idUser}`;
        logDebug('FILE2=', file);
        await uploadToGCSExact(folder, fileHash, fileName, fileType, mimetype, buffer);
        await db.updateStatus(requestID, 4, '');
        const ret = await db.updateUploadedDocs(idUser, requestID, fileName, fileType, buffer);
        logDebug('DB UPLOAD:', ret);

        await db.updateStatus(requestID, 5, '');

        let sent = true;
        const debtCollectors = await db.getDebtCollectors();
        logDebug('debtCollectors=', debtCollectors);
        if (!debtCollectors) {
            return res.status(500).json({requestID, message: 'Failed to get debt collectors'});
        }

        if (await db.hasUserRequestKey(idUser) && user.age) { //FIX: check age, not only if there's a request or not
            return res.json({requestID, step: 999, status: 'DONE', message: 'Emails already sent'});
        }

        let allSent = true;
        const sentStatus = {};
        for (let i = 0; i < debtCollectors.length ; i++) {
            await db.updateStatus(requestID, 10+i, '');
            const { id: idCollector, name: collectorName, email: collectorEmail } = debtCollectors[i];
            const hashSum = crypto.createHash('sha256');
            const hashInput = `${idUser}-${idCollector}-${(new Date()).toISOString()}`;
            logDebug('hashInput=', hashInput);
            hashSum.update(hashInput);
            const requestKey = hashSum.digest('hex');
            logDebug('REQUEST KEY:', requestKey);

            const hash = Buffer.from(`${idUser}__${idCollector}`, 'utf8').toString('base64')

            if (
                await db.setUserRequestKey(requestKey, idUser)
                && await db.setUserCollectorRequestKey(requestKey, idUser, idCollector)
            ) {
                /* prepare email */
                const sendConfig = prepareEmailConfig(projects[project].email, collectorEmail, collectorName, idUser, idCollector, requestKey, hash);
                logDebug('Send config:', sendConfig);

                try {
                    await db.setEmailLog({collectorEmail, idCollector, idUser, requestKey})
                } catch (e) {
                    logDebug('extract() setEmailLog error=', e);
                }

                /* send email */
                const resp = await email.send(sendConfig, projects[project].email.apiKey);
                logDebug('extract() resp=', resp);

                // update DB with result
                await db.setUserCollectorRequestKeyRes(requestKey, idUser, idCollector, resp);

                if (!sentStatus[collectorName])
                    sentStatus[collectorName] = {};
                sentStatus[collectorName][collectorEmail] = resp;

                if (!resp) {
                    allSent = false;
                    logError('extract() Sending email failed: ', resp);
                }
            }
        }

        if (!allSent) {
            return res.status(500).json({requestID, message: 'Failed sending email'});
        }

        await db.updateStatus(requestID, 100, '');

        logDebug('FINAL SENT STATUS:');
        console.dir(sentStatus, {depth: null});

        await db.updateStatus(requestID, 500, '');

        /* prepare summary email */
        const summaryConfig = prepareSummaryEmailConfig(projects[project].email, sentStatus);
        logDebug('Summary config:', summaryConfig);

        /* send email */
        const resp = await sendEmail(sendConfig, projects[project].email.apiKey);
        logDebug('extract() resp=', resp);
        //const respSummary = await email.send(sendConfig, config.projects[project].email.apiKey);
        //logDebug('extract() summary resp=', respSummary);

        await db.updateStatus(requestID, 900, '');
    }
    await db.updateStatus(requestID, 999, '');
    return res.json({requestID, step: 999, status: 'DONE', message: 'Done sending emails...'});
});

async function sendEmail(sendConfig, apiKey) {
    try {
        const resp = await email.send(sendConfig, apiKey);
        return resp;
    } catch (error) {
        logError('Error sending email:', error);
        return null;
    }
}

async function prepareEmailConfig(emailConfig, collectorEmail, collectorName, idUser, idCollector, requestKey, hash) {
    return {
        sender: emailConfig.sender,
        replyTo: emailConfig.replyTo,
        subject: 'Email subject',
        templateId: emailConfig.template.collector,
        params: {
            downloadUrl: `https://url.go/download?requestKey=${requestKey}&hash=${hash}`,
            uploadUrl: `https://url.go/upload?requestKey=${requestKey}&hash=${hash}`,
            confirmUrl: `https://url.go/confirm?requestKey=${requestKey}&hash=${hash}`
        },
        tags: ['request'],
        to: [{ email: collectorEmail , name: collectorName }],
    };
}

function prepareSummaryEmailConfig(emailConfig, sentStatus) {
    return {
        sender: emailConfig.sender,
        replyTo: emailConfig.replyTo,
        subject: 'Oppsummering Kravsforespørsel',
        templateId: emailConfig.template.summary,
        params: {
            collectors: sentStatus,
        },
        tags: ['summary'],
        to: [{ email: 'tomas@upscore.no' , name: 'Tomas' }],
    };
}
