import { LightningElement, track, wire } from 'lwc';
import getTaskById from '@salesforce/apex/TacheController.getTaskById';
import getAllTasks from '@salesforce/apex/TacheController.getAllTasks';
import getCurrentRessource from '@salesforce/apex/timesheetController.getCurrentRessource';
import getProjectById from '@salesforce/apex/TacheController.getProjectById';

export default class MesTaches extends LightningElement {
    @track bShowModal = false;
    @track projectName;
    @track record = {};
    tasks;
    ressource;
    @track projet;
    @track page = 1; //this will initialize 1st page
    @track items = []; //it contains all the records.
    @track data = []; //data to be display in the table
    //@track columns; //holds column info.
    @track startingRecord = 1; //start record position per page
    @track endingRecord = 0; //end record position per page
    @track pageSize = 5; //default value we are assigning
    @track totalRecountCount = 0; //total record count received from all retrieved records
    @track totalPage = 0; //total number of page is needed to display all records
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
        label: 'Tache',
        fieldName: 'Name',
        type: 'Text'
    },
    {
        label: 'Description',
        fieldName: 'Description__c',
        type: 'text',
        sortable: false
    }
    /*{
        label: 'Projet',
        fieldName: 'Projet__c',
        type: 'Text',
        sortable: true
    }*/

];


    connectedCallback(){
        getCurrentRessource()
        .then(result => {
            console.log("Ressource + Id :  "+ result.Id); 
            sessionStorage.setItem('ressource',result.Id);
        })
        .catch(error => {
            this.error = error;
            console.log(error);
        });
        this.ressource =sessionStorage.getItem('ressource');

        getTaskById({ressourceId : sessionStorage.getItem('ressource')})
        .then(result => {
            this.tasks = result; 
            console.log("********tasks");
            console.log(reult);
            this.data = result;
            
        })
        .catch(error => {
            this.error = error;
        });
        
    }

    /*@wire(getTaskById, { ressourceId :'$ressource'})

    data({ error, data }) {
        if (data) {
            this.items = data;
            this.totalRecountCount = data.length; //here it is 23
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); //here it is 5
            
            //initial data to be displayed ----------->
            //slice will take 0th element and ends with 5, but it doesn't include 5th element
            //so 0 to 4th rows will be display in the table
            this.data = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.columns = columns;

            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }
*/
    // Row Action event to show the details of the record
    handleRowAction(event) {
        const row = event.detail.row;
        this.record = row;
         // display modal window
        console.log("row id"+ row.Projet__c);
        //this.projectName
        //getProjectById({id : row.I})
        getProjectById({id : row.Projet__c})
        .then(result => {
           // console.log("********projet"+reult);
            //console.log("********projet name"+reult.Name);
            this.projet = result[0]; 
            console.log("done"+this.projet[0].Name);
            //sess
        })
        .catch(error => {
            this.error = error;
        });
        this.bShowModal = true;
        

    }
 
    // to close modal window set 'bShowModal' tarck value as false
    closeModal() {
        this.bShowModal = false;
    }
     //clicking on previous button this method will be called
     previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    //clicking on next button this method will be called
    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }             
    }
    displayRecordPerPage(page){

        /*let's say for 2nd page, it will be => "Displaying 6 to 10 of 23 records. Page 2 of 5"
        page = 2; pageSize = 5; startingRecord = 5, endingRecord = 10
        so, slice(5,10) will give 5th to 9th records.
        */
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);

        //increment by 1 to display the startingRecord count, 
        //so for 2nd page, it will show "Displaying 6 to 10 of 23 records. Page 2 of 5"
        this.startingRecord = this.startingRecord + 1;
    }
}