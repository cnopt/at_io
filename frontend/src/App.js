import React, { Component, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useQueries } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {_, debounce} from 'lodash';
import axios from 'axios';
import './App.css'
import logo from './at-io.svg'
import pass from './at-io-pass-simple.svg'
import fail from './at-io-fail-simple.svg'

// TODO some sort of batch endpoint where it gets all the current guids in the dropdown and runs reqests on all of them?

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      
      <Logo/>
      <RadioDropdown/>
      {/* <SearchWorkflowsByText/>
      <SearchWorkflowByGUID/> */}
    
    <ReactQueryDevtools/>
    </QueryClientProvider>
  )
}

function RadioDropdown() {
  // State to track selected radio button
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowToCompare, setWorkflowToCompare] = useState(null);
  let selectedFirm, selectedFirmAPIKey, selectedFirmAPISecret, selectedFirmUsername, selectedFirmPassword;

  // Handle radio button change
  const handleSelectionChange = (event) => {
    setSelectedOption(event.target.value);
    setSelectedWorkflow("");
  }

  const handleWorkflowChange = (event) => {
    setSelectedWorkflow(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target.form)
    const selectGuid = document.getElementById('select-workflow-results')
    const option = selectGuid.options[selectGuid.selectedIndex]
    console.log(option.dataset.guid)
    setWorkflowToCompare(option.dataset.guid)

  };

  const [getWorkflowsQuery, compareWorkflowsQuery] = useQueries({
    queries: [
      {
        queryKey:[selectedOption],
        queryFn: async () => {
          switch(selectedOption) {
            case 'crowe':
              selectedFirmAPIKey = 'CroweFinancial';
              selectedFirm = 7;
              selectedFirmAPISecret = 'bd0b85a34eec21877639448ffd68f558';
              selectedFirmUsername = 'crowefinancial';
              selectedFirmPassword = '1a052923a258ec07399e5b6b64f79280';
              break;
            case 'ascot-lloyd':
              selectedFirm = 3
              selectedFirmAPIKey = 'AscotLloyd'
              selectedFirmAPISecret = 'bf380f850db65c6c0cc667df04ebacbd'
              selectedFirmUsername = 'AscotTest'
              selectedFirmPassword = 'f8b075fc911e66e32a382be9295144dd'
              break;
          }
          const response = await axios.get(`http://localhost:1337/firms/${selectedFirm}`)
          console.log(selectedFirm)
          console.log(selectedFirmAPIKey)
          return response.data
        },
        enabled:!!selectedOption
      },
      {
        queryKey: ['getData', workflowToCompare],
        queryFn: async () => {
          // send the api key, secret, username, password as data params here
          const response = await axios({
            method: 'get',
            url: `http://localhost:1337/${workflowToCompare}`,
            headers: {
              "apikey": selectedFirmAPIKey,
              "apiSecret": "fuckyou",
              "apiUsername": `"${selectedFirmUsername}"`,
              "apiPassword": `"${selectedFirmPassword}"`
            }
          })
          return response.data;
        },
        staleTime:500,
        enabled: !!workflowToCompare,
      }
    ]
  })


   // Automatically set the first option of the second dropdown when data is loaded
   useEffect(() => {
    if (getWorkflowsQuery.data) {
      console.log(getWorkflowsQuery.data.results[0].name)
      setSelectedWorkflow(getWorkflowsQuery.data.results[0].name)
    }
  }, [getWorkflowsQuery.data]);
  
  return (
    <>
      <div className="dropdown-container">
        {/* Results Dropdown */}
        <form onSubmit={handleSubmit}>
          <div className='customer-dropdown'>
            <label htmlFor="data-type-select"><span>󰲠</span> Select customer:</label>
            <select
              id="data-type-select"
              value={selectedOption || "empty"}
              onChange={handleSelectionChange}
            >
              <option value="empty" disabled>
                -- Select an option --
              </option>
              <option value="crowe">Crowe Financial</option>
              <option value="ascot-lloyd">Ascot Lloyd</option>
            </select>
          </div>

          {/* Results Dropdown */}
          <div className='workflow-results-dropdown'>
            <label htmlFor="data-type-select"><span>󰲢</span>󱞣</label>
            <select 
            disabled={!selectedOption}
            value={selectedWorkflow}
            name="selectedWorkflow"
            onChange={handleWorkflowChange}
            id='select-workflow-results'
            >
              {!selectedOption && <option>Workflows will appear here..</option>}
              {getWorkflowsQuery.isLoading && <option>Loading...</option>}
              {getWorkflowsQuery.isError && <option className='error-option'>Error loading data</option>}
              {!getWorkflowsQuery.isLoading && !getWorkflowsQuery.isError &&
                getWorkflowsQuery.data?.results.map((item, index) => (
                  <option key={item.guid} data-guid={item.guid}>
                    {item.name}
                  </option>
              ))}
            </select>
          </div>
          <button 
            disabled={!selectedWorkflow}
            onClick={handleSubmit}
          >Compare </button>
        </form>
      </div>

      {compareWorkflowsQuery.isLoading && <div className='loading'>󰇘</div>}

      {/* handle both actual query errors as well as the query being a success but the data contains the error message i've set up */}
      {compareWorkflowsQuery.isError || compareWorkflowsQuery.data?.error && ( 
        <div className='error'>
          <span className='error-icon'> Error</span>
          {compareWorkflowsQuery.isError && (
            <span className='error-message'>{compareWorkflowsQuery.error.message}</span>
          )}
          {compareWorkflowsQuery.data?.error && (
            <span className='error-message'>{compareWorkflowsQuery.data?.error}</span>
          )}
        </div>
      )}

      {/* on success... */}
      {compareWorkflowsQuery.data && !compareWorkflowsQuery.isLoading && !compareWorkflowsQuery.data.error && (
        <ResultDisplay data={compareWorkflowsQuery.data}/>
      )}
    </>
  );
}


function Logo() {
  return(
    <>
      <div className="container">
        <img src={logo} width={140} className='logo'/>
      </div>
    </>
  )
}



function SearchWorkflowByGUID() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);

  useEffect(() => {
    const imageList = [logo, pass, fail]
    imageList.forEach((image) => {
      new Image().src = image
    });
  }, [])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['getData', searchTerm],
    queryFn: async () => {
      const response = await axios
        .get(`http://localhost:1337/${searchTerm}`)
        .then(setIsSearchTriggered(false));
      return response.data;
    },
    enabled: isSearchTriggered,
  });


  console.log(data);

  return (
    <>
      <form >
        <input
          id='workflowInput'
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          name="searchTerm"
          placeholder='Workflow id..'
        />
        <button type="submit">Search</button>
        {isLoading && <div className='loading'>󰇘</div>}
      </form>
      

      {isError && ( 
        <div className='error'>
          <span className='error-icon'> Error</span>
          <span className='error-message'>{error.message}</span>
        </div>
      )}
      
      {data && !isLoading && (
        <ResultDisplay data={data} />
      )}
    </>
  );
}


function ResultDisplay({ data }) {
  return (
    <div className="result-container">
      {typeof data === 'object' ? (
        <>
          <TestOutcomeBadge data={data}/>

          <div className='response-divs'>

            <div className="at-data-grid">
            <table>
              <tr>
                <th colSpan={2}>󰫮󰬁 Config</th>
              </tr>
              <tr>
                <td>Workflow name</td>
                <td>{data.ATResponseJSON.Workflow_name}</td>
              </tr>
              <tr>
                <td style={{borderBottom:"2px dashed #aaa",paddingBottom:"0.5rem"}}>Workflow GUID</td>
                <td style={{borderBottom:"2px dashed #aaa",paddingBottom:"0.5rem"}}>{data.ATResponseJSON.Workflow_GUID}</td>
              </tr>
              {data.ATResponseJSON.Upload_documents.ATUploadDocuments.length > 0 && (
                <tr className='upload-documents-row'>
                  <td colSpan={2}>Upload documents:</td>
                </tr>
              )}
              {data.ATResponseJSON.Upload_documents.ATUploadDocuments.length == 0 && (
                <tr className='upload-documents-row'>
                  <td colSpan={2}>No upload documents present</td>
                </tr>
              )}
              {Object.entries(data.ATResponseJSON.Upload_documents.ATUploadDocuments).map(([key, value]) => (
                <>
                  <tr className="upload-document-title">
                    <td colSpan="2">{value.title}</td>
                  </tr>
                  <tr className="upload-document-guid">
                    <td colSpan="2">{value.guid}</td>
                  </tr>
                </>
              ))}
            </table>
            </div>

            <div className="io-data-grid">
              <table>
                <tr>
                  <th colSpan={2}>󰫶󰫼 Config</th>
                </tr>
                <tr>
                  <td>Workflow name</td>
                  <td>{data.IOResponseJSON.Workflow_name}</td>
                </tr>
                <tr>
                  <td style={{borderBottom:"2px dashed #aaa",paddingBottom:"0.5rem"}}>Workflow GUID</td>
                  <td style={{borderBottom:"2px dashed #aaa",paddingBottom:"0.5rem"}}>{data.IOResponseJSON.Workflow_GUID}</td>
                </tr>
                {data.IOResponseJSON.Upload_documents.IOUploadDocuments.length > 0 && (
                <tr className='upload-documents-row'>
                  <td colSpan={2}>Upload documents:</td>
                </tr>
                )}
                {data.IOResponseJSON.Upload_documents.IOUploadDocuments.length == 0 && (
                  <tr className='upload-documents-row'>
                    <td colSpan={2}>No upload documents present</td>
                  </tr>
                )}
                {Object.entries(data.IOResponseJSON.Upload_documents.IOUploadDocuments).map(([key, value]) => (
                  <>
                    <tr className="upload-document-title">
                      <td colSpan="2">{value.title}</td>
                    </tr>
                    <tr className="upload-document-guid">
                      <td colSpan="2">{value.guid}</td>
                    </tr>
                </>
                ))}
              </table>
            </div>

          </div>
        </>
      ) : (
        <p>{JSON.stringify(data)}</p>
      )}
    </div>
  );
}

function TestOutcomeBadge({data}) {
  if (data.isWorkflowEqual && data.areUploadDocumentsEqual) {
    return(
      <>
        <div className='test-outcome-badge-container'>
          <img src={pass} width={220}/>
        </div>
        <p className='test-outcome-pass'>
          <span className='test-outcome-icon'>󰸞</span>
          Workflow setups match
        </p>
      </>
    ) 
  }
  else if (data.isWorkflowEqual && !data.areUploadDocumentsEqual) {
    return(
      <>
        <div className='test-outcome-badge-container'>
          <img src={fail} width={220}/>
        </div>
        <p className='test-outcome-fail'>
          <span className='test-outcome-icon'></span>
          Upload documents do not match
        </p>
      </>
    )
  }
  else {
    return(
      <>
        <img src={fail} width={220}/>
        <p className='test-outcome-fail'>
          <span className='test-outcome-icon'></span>
          Workflow setups do not match
        </p>
      </>
    )
  }
}


// not used
function SearchWorkflowsByText() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['getData', searchTerm],
    queryFn: async () => {
      const response = await axios
        .get(`http://localhost:1337/search/${searchTerm}`)
        .then(setIsSearchTriggered(false));
      return response.data;
    },
    enabled: isSearchTriggered
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target)
    setSearchTerm(formData.get('searchTerm'))
    setIsSearchTriggered(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='form-search'>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          name="searchTerm"
          placeholder='Workflow name..'
        />
        <button type="submit">Search</button>
        
        {isLoading && <div className='search-loading'>󰇘</div>}
        
        {data && !isLoading && (
          <SearchResults data={data} />
        )}
      </form>
      
      {isError && ( 
        <div className='error'>
          <span className='error-icon'> Error</span>
          <span className='error-message'>{error.message}</span>
        </div>
      )}
      
    </>
  );
}

// also not used
function SearchResults({data}) {
    function setWorkflowTextInputToSelected(id) {
      document.getElementById('workflowInput').value = id
      document.getElementsByClassName('search-results-container')[0].style.display = "none"
    }
    return(
      <div className='search-results-container'>
        {Object.entries(data.results).map(([key, value]) => (
          <>
            <p onClick={()=>{setWorkflowTextInputToSelected(value.guid)}}>{value.name}</p>
          </>
        ))}
      </div>
    )
  }