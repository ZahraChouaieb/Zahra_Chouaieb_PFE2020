import { LightningElement , api , wire , track} from 'lwc';
import { getRecord , getFieldValue , deleteRecord } from 'lightning/uiRecordApi';
import getAllAbsences from '@salesforce/apex/AbsencesController.getAllAbsences';
import getAbsenceById from '@salesforce/apex/AbsencesController.getAbsenceById';
import getStatus from '@salesforce/apex/AbsencesController.getStatus';
import createAbsence from '@salesforce/apex/AbsencesController.createAbsence';
import updateAbsence from '@salesforce/apex/AbsencesController.updateAbsence';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import {  ShowToastEvent } from 'lightning/platformShowToastEvent';
import Conge from '@salesforce/schema/Conge__c';
import Type__c from '@salesforce/schema/Conge__c.Type__c';
import getCurrentRessource from '@salesforce/apex/timesheetController.getCurrentRessource';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
export default class MesAbsences extends NavigationMixin(LightningElement) {
   
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
        label: 'Nom',
        fieldName: 'Name',
        type: 'Text'
    },
    {
        label: 'Date Début',
        fieldName: 'Date_debut__c',
        type: 'date',
        sortable: false
    }
    ,
    {
        label: 'Date Fin',
        fieldName: 'Date_Fin__c',
        type: 'date',
        sortable: false
    },
    {
        label: 'Durée',
        fieldName: 'Duree__c',
        type: 'number',
        sortable: false,
        cellAttributes: { alignment: 'left' }
    }
    ,
    {
        label: 'Statut',
        fieldName: 'Statut__c',
        type: 'text',
        sortable: false
    }
   

];
    absences;
    error;
    Duree;
    @track record = {};
    @track ressourceId;
    showModal = false;
    showDetails = false;
    @track Conge = Conge;
    @api recordId;
    @wire(CurrentPageReference)
    status;
    statusBoolean = [] ;
    //récupérer les valeurs de Type__c Picklist
    @track value;
    @wire(getObjectInfo, { objectApiName: Conge })
    objectInfo;
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: Type__c})
    TypePicklistValues;

    connectedCallback() {

        getCurrentRessource()
        .then(result => {
            this.ressourceId= JSON.stringify(result);
            console.log("Ressource + Id :  "+ this.ressourceId); 
            sessionStorage.setItem('ressource',result.Id);
            
        })
        .catch(error => {
            this.error = error;
            console.log(error);
        });
        
        this.loadAbsences(); 
        getStatus().then(result=>{
            this.status=result;
            status.forEach(statut => {
                    
                if(statut == "En Attente")
                {
                    this.statusBoolean.append(null);
                    statutIsNull =true;
                }
                else if(statut == "Accepté")
                {
                    this.statusBoolean.append(true);
                }
                else{
                    this.statusBoolean.append(false);
                }
                
            });
        }).catch(error => {
            this.error = error;

        });
                    
    }
    
    loadAbsences() {
        console.log("this.ressourceId"+ sessionStorage.getItem('ressource'));
		getAllAbsences({ressourceId : sessionStorage.getItem('ressource')})
			.then(result => {
                this.absences = result; 
                this.types = result.Type; 
			})
			.catch(error => {
				this.error = error;
			});
    } 
  

    get Duree() {
        var answerThis =  Math.abs(this.Date_Fin.getTime() - this.Date_Debut.getTime());
        return answerThis;
    }   
 
    openModal(){
        this.showModal = true;
    }
    closeModal(){
        this.showModal = false;
    }   
    closeDetailsModal()
    {
        this.showDetails = false;
    }
    handleDateDebutChange(event) {
        this.Conge.Date_debut__c = event.target.value;
    }
    handleDateFinChange(event) {
        this.Conge.Date_Fin__c = event.target.value;
    }
    handleTypeChange(event) {
        this.Conge.Type__c = event.target.value;
    }
    handleJustificationChange(event) {
        this.Conge.Justification__c = event.target.value;
    }

    saveAbsence(){
        this.Conge.Ressource__c = sessionStorage.getItem('ressource');
        createAbsence({
            conge: this.Conge
        })
        .then(result => {
            // Clear the user enter values
            console.log("success");
            window.console.log('result ===> ' + result);
            // Show success messsage
            this.dispatchEvent(new ShowToastEvent({
                title: 'Succès!!',
                message: 'Congé ajouté avec succès!!',
                variant: 'success'
            }), );
            this.showModal = false;
        })
        .catch(error => {
            this.error = error.message;
            console.log("error");
            console.log(error.message)
        });
    }
    
    soumettreAbsence(){

    }

    deleteAbsence(event){
        const recordId = event.target.value;
        console.log('delete Absence ' + event.target.value);
        var msg ='Are you sure you want to delete this item?';
        if (!confirm(msg)) {
            console.log('No');
            return false;
        } else {
            console.log('Yes');
            //Write your confirmed logic
            deleteRecord(recordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Succèss!!',
                        message: 'Absence supprimée',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Erreur lors de la suppression de l\'enregistrement',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
        }
    }
    editAbsence(){
        this.Conge.Id = sessionStorage.getItem('absenceId');
        this.Conge.Ressource__c = sessionStorage.getItem('ressource');
        updateAbsence({
            conge: this.Conge
        })
        .then(result => {
            // Clear the user enter values
            console.log("success");
            window.console.log('result ===> ' + result);
            // Show success messsage
            this.dispatchEvent(new ShowToastEvent({
                title: 'Succès!!',
                message: 'Congé modifié avec succès!!',
                variant: 'success'
            }), );
            this.showDetails = false;
        })
        .catch(error => {
            this.error = error.message;
            console.log("error");
            console.log(error.message)
        });

    }

    handleRowAction(event){
        //console.log("navigation !" +absence.Id);
        const recordId = event.target.value;
        
        // const row = event.detail;
        // this.record = row;
       
        
            const row = event.detail.row;
            console.log(row.Id);
            this.record = row;
            sessionStorage.setItem('absenceId',event.target.value);
             // display modal window
           
            //this.projectName
            //getProjectById({id : row.I})
           
            
    
        
        // getAbsenceById({absenceId : recordId})
        // .then(result=>{
        //     this.record = result[0];
        //     console.log(this.record.Name);
        // })
        // .catch(error=>{
        //     console.log(error.message);
        // });
        //   this[NavigationMixin.Navigate]({
        //             type: 'standard__recordPage',
        //             attributes: {
        //                 recordId: event.target.value,
        //                 objectApiName: 'Conge__c',
        //                 actionName: 'view'
        //             }
        //         });
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                objectApiName: 'Conge__c',
                actionName: 'view'
            }
        });
        
        //this.showDetails = true;
    }

 

 
}