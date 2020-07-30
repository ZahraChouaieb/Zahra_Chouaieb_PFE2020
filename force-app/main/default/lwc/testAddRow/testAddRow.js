import { LightningElement, track,api } from 'lwc';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import ACCOUNTNUMBER_FIELD from '@salesforce/schema/Account.AccountNumber';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import saveAccounts from '@salesforce/apex/AccountController.saveAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class CreateDynamicRecord extends LightningElement {
    @track accountList = []; 
    @track index = 0;
    @api recordId;
    @track name = NAME_FIELD;
    @track accNumber = ACCOUNTNUMBER_FIELD;
    @track phone = PHONE_FIELD;
    isLoaded = false;

    @api record = {
        firstName : '',
        lastName : '',
        Email : '',
        Phone : '',
        Title : ''
    }
    days=new Array();
    categories = [
        {value: "Production", label: "Production"},
        {value: "Interne", label: "Interne"}
    ];

    acc = {
        Name : this.name,
        AccountNumber : this.accNumber,
        Phone : this.phone ? this.phone : "",
        key : ''
    }
    connectedCallback(){
        var date = new Date(); 
        var month = date.getMonth()+1; 
        var year = date.getFullYear(); 
        var daysOfTheMonth =new Date(year, month, 0).getDate();
        var days=[];
        for(var i=1;i<=daysOfTheMonth;i++)
        {
            this.days.push(i);
        }  
    }

    addRow(){

        this.index++;
        //var i = JSON.parse(JSON.stringify(this.index));
        var i = this.index;
   
        /*this.accountList.push ({
            sobjectType: 'Account',
            Name: '',
            AccountNumber : '',
            Phone: '',
            key : i
        });*/
        this.acc.key = i;
        this.accountList.push(JSON.parse(JSON.stringify(this.acc)));

        console.log('Enter ',this.accountList);
        
       // this.accountList.push(this.record);
        //console.log(' After adding Record List ', this.accountList);
    }
    
    removeRow(event){
        this.isLoaded = true;
        var selectedRow = event.currentTarget;
        var key = selectedRow.dataset.id;
        if(this.accountList.length>1){
            this.accountList.splice(key, 1);
            this.index--;
            this.isLoaded = false;
        }else if(this.accountList.length == 1){
            this.accountList = [];
            this.index = 0;
            this.isLoaded = false;
        }

        //this.dispatchEvent(new CustomEvent('deleterow', {detail: this.index}));
        //console.log(' After adding Record List ', this.dispatchEvent);
    } 

    

    handleNameChange(event) {
        var selectedRow = event.currentTarget;
        var key = selectedRow.dataset.id;
        var accountVar = this.accountList[key];
        this.accountList[key].Name = event.target.value;
        //this.acc.Name = event.target.value;
        //console.log("name", this.acc.Name);
    }
    
    handleAccountNumberChange(event) {
        /*this.acc.AccountNumber = event.target.value;
        console.log("AccountNumber", this.acc.AccountNumber);*/
        var selectedRow = event.currentTarget;
        var key = selectedRow.dataset.id;
        var accountVar = this.accountList[key];
        this.accountList[key].AccountNumber = event.target.value;
    }
    
    handlePhoneChange(event) {
        /*this.acc.Phone = event.target.value;
        console.log("Phone", this.acc.Phone);*/
        var selectedRow = event.currentTarget;
        var key = selectedRow.dataset.id;
        var accountVar = this.accountList[key];
        this.accountList[key].Phone = event.target.value;
    }
    
    saveRecord(){        
        saveAccounts({accList : this.accountList})
            .then(result => {
                this.message = result;
                this.error = undefined;
                if(this.message !== undefined) {
                    this.acc.Name = '';
                    this.acc.AccountNumber = '';
                    this.acc.Phone = '';
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Account created successfully',
                            variant: 'success',
                        }),
                    );
                }
                
                console.log(JSON.stringify(result));
                console.log("result", this.message);
                /*console.log(' After adding Record List ', result);
                this.accountList = result;
                console.log(' After adding Record List ', this.accountList);*/
            })
            .catch(error => {
                this.message = undefined;
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
                console.log("error", JSON.stringify(this.error));
            });
    }
      
}