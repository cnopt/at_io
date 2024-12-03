const express = require('express');
const cors = require('cors');
const axios = require('axios');
const _ = require('lodash');
const path = require('path');

const app = express();
app.use(cors());
const port = 1337;


const ioCookie = "XSRF-TOKEN=eyJpdiI6InpVYVc1ZmVsazR1TU9sZDJMY1l1b3c9PSIsInZhbHVlIjoiSXBXaHVYcTVjeWQvemhuZjdMUHdCVWpEeEROSVdUQ3NmV2RnNWJiUGxzZ2JhWmQ1OWFVVzFQQ3pJMWU1eis0WE13cUVFYWxndkRhckMrelREMTI0QlE5YVFSSGZQYTNJY0xBMnVNeGVUejc5TkFvTDRZRGwzKy9aeDlBWDNjbFkiLCJtYWMiOiI0YWQ0OGUwMTNlZTI1NDg2ZWZjZTJkZTlkMDE0OTBlNTcxMTAzNDU3OTYyZTllYmFjMWI0YjllOGE5OGI5M2I2IiwidGFnIjoiIn0%3D; alphatrust_io_session=eyJpdiI6ImtpMHhmUVdvYTA3OUsrdkQ0Z1lmMlE9PSIsInZhbHVlIjoidGpyRDloMy84SlduMmtob3BOMnEyenVCOFpTL0p0c3NOak90UWtHaTFBZzVpRmFCdFNBZ01CeHJnRXRGNHZDUWhsNmFXWTAzV3JhYVZsaVk0aVRBSW0zQ1Z3M1dFTUpTOS9GRFg5NTZSaENxcUsyd3U5Z0J2TDE2cU9Ka1hPNlkiLCJtYWMiOiI3MGVkY2FmYzI1MmY0MGE4NTdkMGRiYjZjYWVmOTZlM2RiZDY3YzdlNzJjOTllZjNiNzM3MjYwYWIxNzJmZWY1IiwidGFnIjoiIn0%3D"


// Define a route to serve the HTML file
app.get('/', (req, res) => {
    // Send the HTML file as the response
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.get('/search/:searchTerm', (req, res) => {
    let searchTerm = req.params.searchTerm;
    console.log("searching for workflow: " + searchTerm)

    function searchAlphaTrustForWorkflows() {
        return axios({
            timeout:20000,
            method: 'post',
            url: 'https://alphatrustext.ipipeline.uk.com/REST/api/v5/workflows/list',
            headers: {
                'Content-Type': 'application/json',
                'ApiKey': 'CroweFinancial',
                'ApiSecret': 'bd0b85a34eec21877639448ffd68f558',
                'ApiUsername': 'crowefinancial',
                'ApiPassword': '1a052923a258ec07399e5b6b64f79280'
            },
            data: {
                'ProntoID':'CroweFinancial'
            }
        })
    }

    function searchIOForWorkflows() {
        return axios({
            timeout:20000,
            method: 'get',
            url: 'https://uat.alphatrustio.com/admin/firms/7',
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7",
                "cache-control": "no-cache",
                "connection": "keep-alive",
                "content-type": "application/json",
                "pragma": "no-cache",
                "referer":"https://uat.alphatrustio.com/admin/firms/7",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "X-inertia":"true",
                "X-inertia-version":"0d899dac6275bdd76b94d5f13c437d57",
                "X-requested-with":"XMLHttpRequest",
                "X-socket-id":"200013.652623",
                "upgrade-insecure-requests": "1",
                "cookie": ioCookie
            }
        })
    }

    Promise.all([searchAlphaTrustForWorkflows()])
        .then(function ([SearchResponse]) {
            const allReturnedWorkflows = SearchResponse.data.Workflows
            const filteredWorkflows = _.filter(
                allReturnedWorkflows, function(o) {
                    // to lower on both sides cos includes is case sensitive
                    if (o.Name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        return o
                    }}
            )
            const onlyFilteredWorkflows = [];
            for (let z=0;z<filteredWorkflows.length;z++) {
                console.log(filteredWorkflows[z].Name)
                onlyFilteredWorkflows.push({
                    name: filteredWorkflows[z].Name,
                    guid: filteredWorkflows[z].ID,
                    last_modified: filteredWorkflows[z].LastModifiedDate
                })
            }
            res.json({"results":onlyFilteredWorkflows})
        })

    // Promise.all([searchIOForWorkflows()])
    //     .then(function ([SearchResponse]) {
    //         const allReturnedWorkflows = SearchResponse.data.props.workflows
    //         const filteredWorkflows = _.filter(
    //             allReturnedWorkflows, function(o) {
    //                 // to lower on both sides cos includes is case sensitive
    //                 if (o.name.toLowerCase().includes(searchTerm.toLowerCase())) {
    //                     return o
    //                 }}
    //         )
    //         const onlyFilteredWorkflows = [];
    //         for (let z=0;z<filteredWorkflows.length;z++) {
    //             console.log(filteredWorkflows[z].name)
    //             onlyFilteredWorkflows.push({
    //                 name: filteredWorkflows[z].name,
    //                 guid: filteredWorkflows[z].guid
    //             })
    //         }
    //         res.json({"results":onlyFilteredWorkflows})
    //     })

})

app.get('/firms/:firmId', (req, res) => {
    let firmId = req.params.firmId;
    console.log("getting workflows for firm: " + firmId)

    function getWorkflowsFromIOFirm() {
        return axios({
            timeout: 20000,
            method: 'get',
            url:'https://uat.alphatrustio.com/admin/firms/' + firmId,
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7",
                "cache-control": "no-cache",
                "connection": "keep-alive",
                "content-type": "application/json",
                "pragma": "no-cache",
                "referer":"https://uat.alphatrustio.com/admin/firms/7",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "X-inertia":"true",
                "X-inertia-version":"0d899dac6275bdd76b94d5f13c437d57",
                "X-requested-with":"XMLHttpRequest",
                "X-socket-id":"200013.652623",
                "upgrade-insecure-requests": "1",
                "cookie": ioCookie
            }
        })
    }

    Promise.all([getWorkflowsFromIOFirm()])
    .then(function([IOResponse]) {
        const returnedWorkflowsForFirm = []

        for(let g=0;g<IOResponse.data.props.workflows.length;g++) {
            returnedWorkflowsForFirm.push({
                name: IOResponse.data.props.workflows[g].name,
                guid: IOResponse.data.props.workflows[g].guid
            })
        }

        res.json({
            "results": returnedWorkflowsForFirm
        })
    })

    
})

app.get('/:workflowid', (req, res) => {
    let workflowid = req.params.workflowid;
    let apiKey = req.header('apikey'); // this is still undefined for some reason
    let apiSecret = req.header('apisecret'); // correct way to get header
    let apiUsername= req.header('apiusername');
    let apiPassword = req.header('apipassword');
    console.log("getting data for workflow id: " + workflowid + "\n apiKey: " + apiKey, "\n apiSecret: " + apiSecret + "\n apiUsername: " + apiUsername);
    console.log(req.headers)

    function getUploadDocumentsFromIO() {
        return axios({
            timeout: 20000,
            method: 'get',
            //url: 'https://uat.alphatrustio.com/admin/firms/7',
            url:'https://uat.alphatrustio.com/admin/workflow/' + workflowid,
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7",
                "cache-control": "no-cache",
                "connection": "keep-alive",
                "content-type": "application/json",
                "pragma": "no-cache",
                "referer":"https://uat.alphatrustio.com/admin/firms/7",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "X-inertia":"true",
                "X-inertia-version":"0d899dac6275bdd76b94d5f13c437d57",
                "X-requested-with":"XMLHttpRequest",
                "X-socket-id":"200013.652623",
                "upgrade-insecure-requests": "1",
                "cookie": ioCookie
            }
        })
    }

    // modify this so that it gets the data params that are now sent with the query, and uses those to fill out the api credentials
    function getWorkflowFromAT() {
        return axios({
            timeout: 20000,
            method: 'post',
            url: 'https://alphatrustext.ipipeline.uk.com/REST/api/v5/workflows/launch',
            headers: {
                "Content-Type": "application/json",
                "ApiKey": "CroweFinancial",
                "ApiSecret": "bd0b85a34eec21877639448ffd68f558",
                "ApiUsername": "crowefinancial",
                "ApiPassword": "1a052923a258ec07399e5b6b64f79280"
            },
            data: {
                "ID": workflowid
            }
        })
    }


    Promise.all([getUploadDocumentsFromIO(), getWorkflowFromAT()])
        .then(function ([IOResponse, ATResponse]) {
            // make new array to hold the AlphaTrust upload documents ONLY (AT gets all documents)
            const IOUploadDocuments = [];
            const ATUploadDocuments = [];

            console.log("..both promises returned..");

            // quick visual test
            //console.log("IO response: " + IOResponse.data.props.workflow.name)
            //console.log("AT response: " + ATResponse.data.Workflow.Name)

            // loop thru each Document returned and add all the uploadable ones to new array
            for (var e=0;e<IOResponse.data.props.workflow.document_guids.length;e++) {
                IOUploadDocuments.push({
                    title: IOResponse.data.props.workflow.document_guids[e].title,
                    guid: IOResponse.data.props.workflow.document_guids[e].guid
                })
            }
            
            // THIS is where it'll fuck up. maybe here i need to check the response for if it contains isSuccessful.
            // done , the API returns an error message, now i need to stop the frontend from trying to do anything with the component if this new error is returned
            // loop thru each Document returned and add all the uploadable ones to new array
            if (ATResponse.data.Workflow) {
                for (var i=0;i<ATResponse.data.Workflow.Documents.length;i++) {
                    if (ATResponse.data.Workflow.Documents[i].UploadRequiredAtLaunch) {
                        ATUploadDocuments.push({
                            title: ATResponse.data.Workflow.Documents[i].Title,
                            guid: ATResponse.data.Workflow.Documents[i].ID
                        })
                    }
                }
    
                let IOResponseJSON = {
                        "Workflow_name": IOResponse.data.props.workflow.name,
                        "Workflow_GUID": IOResponse.data.props.workflow.guid,
                        "Upload_documents": {
                            IOUploadDocuments
                        }
                }
                let ATResponseJSON = {
                        "Workflow_name": ATResponse.data.Workflow.Name,
                        "Workflow_GUID": ATResponse.data.Workflow.ID,
                        "Upload_documents": {
                            ATUploadDocuments
                        }
                }
    
                let areUploadDocumentsEqual = _.isEqual(
                    IOResponseJSON.Upload_documents.IOUploadDocuments,
                    ATResponseJSON.Upload_documents.ATUploadDocuments)
                let isWorkflowEqual = _.isEqual(
                    IOResponseJSON.Workflow_GUID,
                    ATResponseJSON.Workflow_GUID
                )
    
                res.json({
                    "isWorkflowEqual": isWorkflowEqual,
                    "areUploadDocumentsEqual": areUploadDocumentsEqual,
                    IOResponseJSON,
                    ATResponseJSON
                })
            }
            else {
                res.json({
                    "error": "Workflow does not exist in AlphaTrust, only in iO"
                })
            }
            
            
        });
})


app.listen(port, () => {
    console.log('server is listening on port ', port);
});
