import { LightningElement , track} from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

import getTimesheetByRessourceId from '@salesforce/apex/timesheetController.getTimesheetByRessourceId';
import getCurrentRessource from '@salesforce/apex/timesheetController.getCurrentRessource';

export default class MesFeuillesDuTemps extends NavigationMixin(LightningElement){
    @track bShowModal = false;
    @track projectName;
    @track record = {};
    timesheets;
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
            label: 'Statut',
            fieldName: 'Etat__c',
            type: 'text',
            sortable: false
        },
        {
        label: 'Feuille du Temps',
        fieldName: 'Name',
        type: 'Text'
    },
    {
        label: 'Mois',
        fieldName: 'Mois__c',
        type: 'text',
        sortable: false
    },
    {
        label: 'Année',
        fieldName: 'Annee__c',
        type: 'number',
        sortable: false,
        cellAttributes: { alignment: 'left' }
    }
];

async connectedCallback(){
    getCurrentRessource()
    .then(result => {
        console.log("Ressource + Id :  "+ result.Id); 
        sessionStorage.setItem('ressource',result.Id);
    })
    .catch(error => {
        this.error = error;
        console.log(error);
    });

    getTimesheetByRessourceId({ressourceId : sessionStorage.getItem('ressource')})
    .then(result => {
        this.timesheets = result; 
        console.log("********timesheets");
       
        console.log(reult);
    })
    .catch(error => {
        this.error = error;
    });
    
}

handleRowAction(event) {
    const row = event.detail.row;
    this.record = row;
    this.bShowModal = true; // display modal window
    const recordId = row.Id;
    console.log("row"+ row);
    console.log("evt value "+row.Id);
        
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: recordId,
            objectApiName: 'Feuille_Du_Temps__c',
            actionName: 'view'
        }
    });
}

// to close modal window set 'bShowModal' tarck value as false
closeModal() {
    this.bShowModal = false;
}
}