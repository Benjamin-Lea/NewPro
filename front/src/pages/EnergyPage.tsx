import EnergyDataGraph from '../components/EnergyDataGraph';
import Sidebar from '../components/SideBar';
import React, { useEffect, useState } from 'react';

const EnergyPage = () => (
  <div>
    <Sidebar />
    <h1>Energy Dashboard</h1>
    <EnergyDataGraph />
  </div>
);

export default EnergyPage;
