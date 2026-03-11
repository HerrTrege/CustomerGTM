import React, { useState } from 'react';
import initialData from './data.json';

function App() {
  const [companies, setCompanies] = useState(initialData.companies);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showActivityManager, setShowActivityManager] = useState(false);
  
  // States för att skapa ny aktivitet
  const [newActivityName, setNewActivityName] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("Retail");

  // Funktion för att skapa aktivitet och mappa till bolag
  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!newActivityName) return;

    // Uppdatera bolagen som matchar branschen (eller alla om man skulle vilja)
    const updatedCompanies = companies.map(company => {
      if (company.industry === targetIndustry || targetIndustry === "Alla") {
        return {
          ...company,
          activities: [
            ...company.activities,
            { name: newActivityName, status: "Inbjuden" } // Standardstatus sätts här
          ]
        };
      }
      return company;
    });

    setCompanies(updatedCompanies);
    setNewActivityName("");
    alert(`Aktiviteten "${newActivityName}" har applicerats på alla bolag inom ${targetIndustry}!`);
  };

  // Funktion för att ändra status på en aktivitet för ett specifikt bolag
  const updateActivityStatus = (companyId, activityName, newStatus) => {
    const updatedCompanies = companies.map(company => {
      if (company.id === companyId) {
        const updatedActivities = company.activities.map(act => 
          act.name === activityName ? { ...act, status: newStatus } : act
        );
        return { ...company, activities: updatedActivities };
      }
      return company;
    });
    setCompanies(updatedCompanies);
    
    // Uppdatera även selectedCompany så vyn uppdateras live
    if (selectedCompany && selectedCompany.id === companyId) {
      setSelectedCompany(updatedCompanies.find(c => c.id === companyId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-blue-900">GTM Tracker - D365</h1>
          <div className="space-x-4">
            <button onClick={() => {setSelectedCompany(null); setShowActivityManager(false);}} className="text-blue-600 font-semibold hover:underline">Bolagslista</button>
            <button onClick={() => {setShowActivityManager(true); setSelectedCompany(null);}} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Skapa Aktivitet</button>
          </div>
        </header>

        {/* Vy: Hantera Aktiviteter */}
        {showActivityManager && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Skapa ny GTM Aktivitet</h2>
            <form onSubmit={handleCreateActivity} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-semibold mb-1">Aktivitetens namn (t.ex. Retailmässa 2024)</label>
                <input type="text" value={newActivityName} onChange={(e) => setNewActivityName(e.target.value)} className="w-full border p-2 rounded" placeholder="Namn på aktivitet..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Målgrupp (Bransch)</label>
                <select value={targetIndustry} onChange={(e) => setTargetIndustry(e.target.value)} className="w-full border p-2 rounded">
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Alla">Alla branscher</option>
                </select>
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Skapa & Applicera</button>
            </form>
          </div>
        )}

        {/* Vy: Bolagslista */}
        {!selectedCompany && !showActivityManager && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company) => (
              <div key={company.id} onClick={() => setSelectedCompany(company)} className="bg-white p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md border-l-4 border-blue-600 transition">
                <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{company.industry} • {company.revenue}</p>
                <div className="text-sm">
                  <strong>ERP:</strong> {company.erp} <br/>
                  <strong>Öppna möjligheter:</strong> {company.d365Opportunities.length} st
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vy: Bolagsdetaljer */}
        {selectedCompany && !showActivityManager && (
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <button onClick={() => setSelectedCompany(null)} className="text-sm text-blue-600 mb-4 hover:underline">← Tillbaka till listan</button>
            
            <h2 className="text-3xl font-bold mb-1">{selectedCompany.name}</h2>
            <p className="text-gray-500 mb-6">{selectedCompany.industry} | {selectedCompany.countries.join(", ")} | {selectedCompany.revenue}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vänster spalt: System & Personer */}
              <div>
                <h3 className="text-xl font-bold border-b pb-2 mb-3">Nuvarande System</h3>
                <ul className="mb-6 space-y-1">
                  <li><strong>ERP:</strong> {selectedCompany.erp}</li>
                  <li><strong>POS:</strong> {selectedCompany.pos}</li>
                  <li><strong>CXE:</strong> {selectedCompany.cxe}</li>
                </ul>

                <h3 className="text-xl font-bold border-b pb-2 mb-3">Beslutsfattare</h3>
                <ul className="list-disc pl-5 mb-6">
                  {selectedCompany.decisionMakers.map((dm, i) => <li key={i}>{dm}</li>)}
                </ul>
              </div>

              {/* Höger spalt: Affärsbehov & Aktiviteter */}
              <div>
                <h3 className="text-xl font-bold border-b pb-2 mb-3">Pain Points (Senaste 2 åren)</h3>
                <ul className="list-disc pl-5 mb-6 text-red-600">
                  {selectedCompany.painPoints.map((pp, i) => <li key={i}>{pp}</li>)}
                </ul>

                <h3 className="text-xl font-bold border-b pb-2 mb-3">D365 Möjligheter</h3>
                <ul className="list-disc pl-5 mb-6 text-green-700">
                  {selectedCompany.d365Opportunities.map((opp, i) => <li key={i}>{opp}</li>)}
                </ul>
              </div>
            </div>

            {/* Aktivitetsstatus */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4">Aktiviteter & Status</h3>
              {selectedCompany.activities.length === 0 ? (
                <p className="text-gray-500 italic">Inga inplanerade aktiviteter för detta bolag.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2">Aktivitet</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompany.activities.map((act, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 font-semibold">{act.name}</td>
                        <td className="py-3">
                          <select 
                            value={act.status} 
                            onChange={(e) => updateActivityStatus(selectedCompany.id, act.name, e.target.value)}
                            className="border p-1 rounded text-sm bg-white"
                          >
                            <option value="Inbjuden">Inbjuden</option>
                            <option value="Deltog">Deltog</option>
                            <option value="Uppföljning krävs">Uppföljning krävs</option>
                            <option value="Ej intresserad">Ej intresserad</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
