import React from 'react';
import Form from "../components/Form/Form"
import {useSelector} from "react-redux";
import {StatisticsSelectors} from "../redux/reducers/statistics";
import {SavedStatisticsInstance} from "../types";
import {Links} from "../types/routes";

function Home() {
  const optionsData = useSelector(StatisticsSelectors.getOptions);

  const getSavedStatistics = (): SavedStatisticsInstance[] => {
    const value = localStorage.getItem("savedStatistics")
    return value !== null ? JSON.parse(value) : {}
  }

  return (
    <div style={{marginLeft: '40px', marginRight: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center'}} className="App">
      {optionsData && <>
        <h2>{optionsData.title}</h2>
        <Form />
      </>}
      {Object.keys(getSavedStatistics()).length ? <h2>Saved statistics charts</h2> : ''}
      <ul>
        {Object.entries(getSavedStatistics()).map(stat =>(
          <li key={stat[0]}>
            <a href={`${Links.Statistics}?${stat[0]}`}>{stat[1].comment || stat[0]}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
