import { LightningElement , track } from 'lwc';
import getProjects from '@salesforce/apex/ProjetController.getProjects';
import getCurrentRessource from '@salesforce/apex/timesheetController.getCurrentRessource';
import getClientById from '@salesforce/apex/ProjetController.getClientById';


export default class MesProjets extends LightningElement {
    @track client;
    @track bShowModal = false;
    @track isProjets = false;
    @track record = {};
    @track columns = [
        {
            label: 'Détails',
            type: 'button-icon',
            initialWidth: 75,
            typeAttributes: {
                iconName: 'action:preview',
                title: 'Preview',
                variant: 'border-filled',
                alternativeText: 'Détails'
            }
        },
        {
        label: 'Projet',
        fieldName: 'Name',
        type: 'Text'
    },
    {
        label: 'Description',
        fieldName: 'Description__c',
        type: 'text',
        sortable: false
    }
    ,
    {
    label: 'Date Début',
    fieldName: 'Date_debut__c',
    type: 'Date'
},
{
label: 'Date Fin',
fieldName: 'Date_Fin__c',
type: 'Date'
}];
projects;
@track data = [];
connectedCallback(){
    getCurrentRessource()
    .then(result => {
        console.log("Ressource + Id :  "+ result.Id); 
        sessionStorage.setItem('manager',result.Id);
        
    })
    .catch(error => {
        this.error = error;
        console.log(error);
    });

    getProjects({managerId : sessionStorage.getItem('manager')})
    .then(result => {
        this.projects = result; 
        console.log("********projects");
        console.log(result);
        this.data = result;
        if(this.data.length>0)
        {
            this.isProjets = true;
        }
        
    })
    .catch(error => {
        console.log(error);
    });
    
}
handleRowAction(event) {
    const row = event.detail.row;
    this.record = row;
    this.bShowModal = true;
     // display modal window
     console.log("row.Client__c"+row.Client__c);
    //this.projectName
    //getProjectById({id : row.I})
    getClientById({idClient : row.Client__c})
    .then(result => {
        this.client = result; 
        console.log("done"+result[0].Name);
    })
    .catch(error => {
        this.error = error;
    });
    
}
closeModal() {
    this.bShowModal = false;
}
}