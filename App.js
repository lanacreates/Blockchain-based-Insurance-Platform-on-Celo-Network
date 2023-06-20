import { ethers } from 'ethers';
import InsuranceProvider from './InsuranceProvider.json';
import Policy from './Policy.json';
import { useState, useEffect } from 'react';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = provider.getSigner();
const InsuranceProviderAddress = '0x...';
const insuranceProvider = new ethers.Contract(InsuranceProviderAddress, InsuranceProvider.abi, signer);

function App() {
  const [policies, setPolicies] = useState([]);
  const [premium, setPremium] = useState();
  const [coverage, setCoverage] = useState();
  const [claimAmount, setClaimAmount] = useState();
  const [selectedPolicyId, setSelectedPolicyId] = useState();

  useEffect(() => {
    async function fetchPolicies() {
      const policyCount = await insuranceProvider.getPolicyCount();
      
      const policyPromises = Array.from({length: policyCount}, (_, i) => insuranceProvider.policies(i));
      const policyAddresses = await Promise.all(policyPromises);
      
      const policyObjects = policyAddresses.map(address => {
        return {
          id: address,
          contract: new ethers.Contract(address, Policy.abi, signer)
        }
      });

      setPolicies(policyObjects);
    }
    
    fetchPolicies();
  }, []);

  async function createPolicy() {
    try {
      const tx = await insuranceProvider.createPolicy(signer.getAddress(), premium, coverage);
      await tx.wait();
      
      alert('Policy created');
    } catch (error) {
      console.error('An error occurred while creating the policy:', error);
    }
  }
  
  async function fileClaim() {
    try {
      const selectedPolicy = policies.find(policy => policy.id === selectedPolicyId);
      const tx = await selectedPolicy.contract.fileClaim(claimAmount);
      await tx.wait();
      
      alert('Claim filed');
    } catch (error) {
      console.error('An error occurred while filing the claim:', error);
    }
  }

  async function activatePolicy() {
    try {
      const selectedPolicy = policies.find(policy => policy.id === selectedPolicyId);
      const tx = await selectedPolicy.contract.activate();
      await tx.wait();
      
      alert('Policy activated');
    } catch (error) {
      console.error('An error occurred while activating the policy:', error);
    }
  }

  return (
    <div>
      <input type="number" value={premium} onChange={e => setPremium(e.target.value)} placeholder="Premium" />
      <input type="number" value={coverage} onChange={e => setCoverage(e.target.value)} placeholder="Coverage" />
      <button onClick={createPolicy}>Create Policy</button>
      
      <select value={selectedPolicyId} onChange={e => setSelectedPolicyId(e.target.value)}>
        {policies.map(policy => <option key={policy.id} value={policy.id}>{policy.id}</option>)}
      </select>
      
      <input type="number" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} placeholder="Claim Amount" />
      <button onClick={fileClaim}>File Claim</button>
      <button onClick={activatePolicy}>Activate Policy</button>
      
      {policies.map(policy => {
        return (
          <div key={policy.id}>
            <h2>Policy: {policy.id}</h2>
            <button onClick={() => checkPolicyState(policy)}>Check Status</button>
            <div id={`policy-${policy.id}`}></div>
          </div>
        );
      })}
    </div>
  );

  async function checkPolicyState(policy) {
    try {
      const isActive = await policy.contract.isActive();
      const status = isActive ? 'Active' : 'Inactive';
      const claimAmount = await policy.contract.claimAmount();
      const statusElement = document.getElementById(`policy-${policy.id}`);

      statusElement.textContent = `Status: ${status}, Claim Amount: ${claimAmount.toString()}`;
    } catch (error) {
      console.error('An error occurred while checking the policy status:', error);
    }
  }
}

export default App;
