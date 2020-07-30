import { LightningElement, wire, track, api} from 'lwc';
import firstDayOfWeek from '@salesforce/i18n/firstDayOfWeek';
import USER_ID from '@salesforce/user/Id';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import getMonth from '@salesforce/apex/timesheetController.getMonth';
import getInterneByCategorie from '@salesforce/apex/timesheetController.getInterneByCategorie';
import getProductionByTask from '@salesforce/apex/timesheetController.getProductionByTask';
import getProduction from '@salesforce/apex/timesheetController.getProduction';
import getCurrentRessource from '@salesforce/apex/timesheetController.getCurrentRessource';
import saveProduction from '@salesforce/apex/timesheetController.saveProduction';
import createInterne from '@salesforce/apex/timesheetController.createInterne';
import Feuille_Du_Temps__c from '@salesforce/schema/Feuille_Du_Temps__c';
import Production__c from '@salesforce/schema/Production__c';
import Interne__c from '@salesforce/schema/Interne__c';
import saveInterne from '@salesforce/apex/timesheetController.saveInterne';
import updateTimeSheet from '@salesforce/apex/timesheetController.updateTimeSheet';
import saveTimeSheet from '@salesforce/apex/timesheetController.saveTimeSheet';
import getInterne from '@salesforce/apex/timesheetController.getInterne';
import {  ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTasks from '@salesforce/apex/timesheetController.getTasks';
import getTimesheetByMonth from '@salesforce/apex/timesheetController.getTimesheetByMonth';
import totalInterne from '@salesforce/apex/timesheetController.totalInterne';
import totalProduction from '@salesforce/apex/timesheetController.totalProduction';
import totalAbsence from '@salesforce/apex/AbsencesController.totalAbsence';
import getAbsenceByMonth from '@salesforce/apex/AbsencesController.getAbsenceByMonth';
import getTasksNames from '@salesforce/apex/timesheetController.getTasksNames';
import getTaskByName from '@salesforce/apex/timesheetController.getTaskByName'




export default class FeuilleDuTemps extends LightningElement {
    @track myDict = [];
    @track hasFormation = false;
    @track hasEncadrement = false;
    @track hasAutre = false;
    month;
    formationList= [];
    encadrementList = [];
    autreListe = [];
    @api recordId;
    @track productions = [];
    @track prods = [];
    @track daysList = []; 
    @track index = 0;
    @track absences = [];
    @track internesList= [];
    @track listProductions = [];
    @track encadrement =[];
    @track autre =[];
    @track absencesList= [];
    @track totalInternes = 0;
    @track totalProductions =0;
    @track totalAbsences =0;
    interneNotNull = false;
    isLoaded = false;
    dayObj = {
        Date : '',
        Value : 0,
        key : ''
    }
  
    liste=[];
    i;
        
    ressourceId;
    workHours=[];
    mondayObj=[];
    
    Feuille_Du_Temps__c = Feuille_Du_Temps__c;
    @track Production = Production__c;
    @track Interne = Interne__c;
    @track nbHeures =0 ;
    @track index = 0;
    @track daysList = []; 
    @track internesByMonth = [];
    @track productionByMonth = [];
    
    day = {
        value : '',
        date : '',
        key : ''
    }
    @track listInternes;
    hidePrint = false;
     tasks;
     taskNames=[];
     error;
     TodayDate = new Date();
     weekView =false;
     @track monday=0;
     @track tuesday=0;
     @track wednesday=0;
     @track thursday=0;
     @track friday=0;
     @track saturday=0;
     @track sunday=0;
     monthView = true;
     days=new Array();
     absencesDays = new Array();
     @track valueCategorie;
     @track interneValue;
     @track productionValue;
     isProduction = false;
     isInterne= false;
     count = 1;
     timesheetRows=[{Id:this.count}];
     categories = [
        {value: "Production", label: "Production"},
        {value: "Interne", label: "Interne"}
    ];
    views = [
        {value: "semaine", label: "Vue de semaine"},
        {value: "mois", label: "Vue de mois"}
    ]
    internes = [
        {value: "Formation", label: "Formation"},
        {value: "Encadrement", label: "Encadrement"},
        {value: "Autre", label: "Autre"}
    ];
    monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai","Juin","Juillet", "Aout", "Septembre", "Octobre", "Novembre","Decembre"];

 
connectedCallback()
{
    
    console.log("recordid"+ this.recordId);
    this.interneNotNull = false; 
    var date = new Date(); 
    getTimesheetByMonth({id: this.recordId})
    .then(result => {
        console.log("Timesheet + Id :  "+ result[0].Id); 
        sessionStorage.setItem('timesheetMonth', result[0].Mois__c);
        sessionStorage.setItem('timesheetYear', result[0].Annee__c);
        console.log("***************timesheetMonth"+result[0].Mois__c);
        console.log("***************timesheetYear"+result[0].Annee__c);
    })
    .catch(error=>{
        console.log(error.message);
    });
    getCurrentRessource()
        .then(result => {
            this.ressourceId= JSON.stringify(result);
            console.log("Ressource + Id :  "+ this.ressourceId); 
            sessionStorage.setItem('ressource',result.Id);
        })
        .catch(error => {
            this.error = error;
            console.log(error.message);
        });
        console.log("test");
        var daysOfTheMonth =new Date( sessionStorage.getItem('timesheetYear'), sessionStorage.getItem('timesheetMonth'), 0).getDate();
        console.log("daysOfTheMonth"+daysOfTheMonth);
        getAbsenceByMonth({ressourceId: sessionStorage.getItem('ressource') , month :sessionStorage.getItem('timesheetMonth')})
            .then(result => {
                console.log("getAbsenceByMonth"+ result); 
                this.absences = result;
                var dictAbsences =[];
                if(result!= undefined)
                {
                    result.forEach(absence => {
                        var d = absence.Date_debut__c.split('-')[2];
                        var obj = {
                            jour : d,
                            duree : absence.Duree__c,
                            
                        }
                        dictAbsences.push(obj);
                    });
                    console.log("dictAbsences"+dictAbsences);
                    for(var i=1;i<=daysOfTheMonth;i++)
                    {
                        this.absencesList.push({
                            Date : i,
                            Value : 0,
                            key : i,
                            isAbsence : false
                         });
                        this.absencesDays.push(i);
                    } 
                    for(var j=0; j<dictAbsences.length;j++)
                        {
                                console.log(dictAbsences.length);
                                this.absencesList[dictAbsences[j].jour-1].Value= dictAbsences[j].duree;
                                for(var w =0; w<dictAbsences[j].duree-1; w++)
                                {
                                    console.log("dictAbsences[j].duree"+dictAbsences[j].duree);
                                    this.absencesList[dictAbsences[j+w].jour-1].isAbsence = true;
                                    this.absencesList[dictAbsences[j+w].jour-1].Key = dictAbsences[j+w].jour-1;
                                    console.log("this.absencesList[dictAbsences[j+w].jour-1] Key"+this.absencesList[dictAbsences[j+w].jour-1].Key);
                                }
                                this.absencesList[dictAbsences[j].jour-1].Key = dictAbsences[j].jour-1;
                                this.absencesList[dictAbsences[j].jour-1].isAbsence = true;
                                console.log("dictAbsences.length"+dictAbsences.length);
                        }
                }
            })
            .catch(error => {
                console.log(error.message);
            });
            totalAbsence({ressourceId : sessionStorage.getItem('ressource') , month : sessionStorage.getItem('timesheetMonth') })
            .then(result=>{
                this.totalAbsences = result;
            })
            .catch(error=>{
                console.log(error.message);
            });

            totalInterne({timesheetId : this.recordId })
            .then(result=>{
                this.totalInternes = result;
            })
            .catch(error=>{
                console.log(error.message);
            });

            totalProduction({timesheetId : this.recordId })
            .then(result=>{
                this.totalProductions = result;
            })
            .catch(error=>{
                console.log(error.message);
            });
            for(var i=1;i<=daysOfTheMonth;i++)
            {
                this.days.push(i);
            }

            this.loadTasks(sessionStorage.getItem('ressource'));
            getProduction({timesheet : this.recordId})
            .then(result=>{
                console.log("getProduction"+result);

            })
            .catch(error=>{
                console.log(error.message);
            });
           
            this.internes.forEach(categorie => {
                getInterneByCategorie({timesheet :this.recordId , month :sessionStorage.getItem('timesheetMonth'), categorie : categorie.value})
                .then(rslt=>{
                    if(categorie.value == "Formation")
                    {

                        this.interneNotNull = true;
                        this.formationList = rslt;
                        if(this.formationList.length>0)
                        {
                            this.hasFormation = true;
                        }
                        console.log("this.formationList"+this.formationList);
                        this.Interne.Categorie__c = "Formation";
                        var dictInternes =[];
        
                        rslt.forEach(interne => {
                            var d = interne.Date__c.split('-')[2];
                            this.isInterne = true;
                            var obj = {
                                jour : d,
                                duree : interne.Duree__c,
                                categorie : interne.Categorie__c
                            }
                            dictInternes.push(obj);
                        
                        });
                        console.log("dictInternes  " + dictInternes);
                        // for(var i=1;i<=daysOfTheMonth;i++)
        
                        for(var i=1;i<=daysOfTheMonth;i++)
                        {
                            this.internesList.push({
                                Date : i,
                                Value : 0,
                                key : '',
                                Categorie :'' });
                        } 
                        for(var j=0; j<dictInternes.length;j++)
                            {
                                console.log(dictInternes.length);
                                this.internesList[dictInternes[j].jour-1].Value= dictInternes[j].duree;
                                this.internesList[dictInternes[j].jour-1].Key = dictInternes[j].jour;
                                this.internesList[dictInternes[j].jour-1].Categorie = dictInternes[j].categorie;
                                this.valueCategorie= dictInternes[j].categorie;
                                console.log("this.internesList[dictInternes[j].jour-1]"+this.internesList[dictInternes[j].jour-1].Value);
                            }
                            this.daysList.push(this.internesList);

        }
                    else if(categorie.value == "Encadrement")
                    {
                        this.encadrementList=rslt;
                        if(this.encadrementList.length>0)
                        {
                            this.hasEncadrement = true;
                        }
                        console.log("this.encadrementList"+this.encadrementList);
                        var dictEncadrement =[];
                        rslt.forEach(interne => {
                            var d = interne.Date__c.split('-')[2];
                            this.isInterne = true;
                            var obj = {
                                jour : d,
                                duree : interne.Duree__c,
                                categorie : interne.Categorie__c
                            }
                            dictEncadrement.push(obj);
                        });
                        console.log("dictInternes  " + dictEncadrement);
                        for(var i=1;i<=daysOfTheMonth;i++)
                        {
                            this.encadrement.push({
                                Date : i,
                                Value : 0,
                                key : '',
                                Categorie :'' });
                        } 
                        for(var j=0; j<dictEncadrement.length;j++)
                            {
                                console.log(dictEncadrement.length);
                                this.encadrement[dictEncadrement[j].jour-1].Value= dictEncadrement[j].duree;
                                this.encadrement[dictEncadrement[j].jour-1].Key = dictEncadrement[j].jour;
                                this.encadrement[dictEncadrement[j].jour-1].Categorie = dictEncadrement[j].categorie;
                                this.valueCategorie= dictEncadrement[j].categorie;
                                console.log("this.encadrement[dictInternes[j].jour-1]"+this.encadrement[dictEncadrement[j].jour-1].Value);
                            }
                    }
                    else{
                        this.autreListe = rslt;
                        if(this.autreListe.length>0)
                        {
                            this.hasAutre = true;
                        }
                        console.log("this.autreListe"+this.autreListe);
                        var dictAutre =[];
                        rslt.forEach(interne => {
                            var d = interne.Date__c.split('-')[2];
                            this.isInterne = true;
                            var obj = {
                                jour : d,
                                duree : interne.Duree__c,
                                categorie : interne.Categorie__c
                            }
                            dictAutre.push(obj);
                        });
                        console.log("dictInternes  " + dictAutre);
                        for(var i=1;i<=daysOfTheMonth;i++)
                        {
                            this.autre.push({
                                Date : i,
                                Value : 0,
                                key : '',
                                Categorie :'' });
                        } 
                        for(var j=0; j<dictAutre.length;j++)
                            {
                                console.log(dictAutre.length);
                                this.autre[dictAutre[j].jour-1].Value= dictAutre[j].duree;
                                this.autre[dictAutre[j].jour-1].Key = dictAutre[j].jour;
                                this.autre[dictAutre[j].jour-1].Categorie = dictAutre[j].categorie;
                                this.valueCategorie= dictAutre[j].categorie;
                                console.log("this.encadrement[dictInternes[j].jour-1]"+this.autre[dictAutre[j].jour-1].Value);
                            }
                    }
                })
                .catch(error =>{
               
                    console.log(error);
            });
            });
            console.log("getTaskByName");
   
    
    getTaskByName({taskName : 'Module gestion des congés'})
    .then( result => {
       console.log("test task by name " + result[0].Name);
    })
    .catch(error=>{
        console.log(error.message);
    });
        
      }
        
     handleDayChange(event)
     {
    
        if(event.target.name == 'monday')
        {
            this.monday =parseInt(event.target.value);
            sessionStorage.setItem('monday', event.target.value);
         
         
         console.log("nbHeures "+this.nbHeures);
         var d = new Date();
         d.setDate(d.getDate() - (d.getDay() + 6) % 7);
         console.log("date monday "+ d);
         this.mondayObj.push({
            date:   d,
            value: event.target.value
        });
        console.log("tab monday length**** "+this.mondayObj.length);
        console.log("tab monday last value**** "+this.mondayObj[(this.mondayObj.length )-1].value);
        this.nbHeures += this.mondayObj[(this.mondayObj.length )-1].value;
        
        }
        if(event.target.name == 'tuesday')
        {
            this.tuesday =parseInt(event.target.value);
         sessionStorage.setItem('tuesday', event.target.value);
         
        }
        if(event.target.name == 'thursday')
        {
            this.thursday =parseInt(event.target.value);
         sessionStorage.setItem('thursday', event.target.value);
        }
        if(event.target.name == 'friday')
        {
            this.friday =parseInt(event.target.value);
         sessionStorage.setItem('friday', event.target.value);
        }
        if(event.target.name == 'saturday')
        {
            this.saturday =parseInt(event.target.value);
         sessionStorage.setItem('saturday', event.target.value);
        }
        if(event.target.name == 'sunday')
        {
            this.sunday =parseInt(event.target.value);
         sessionStorage.setItem('sunday', event.target.value);
        }
     }
     updateNbHeures()
     {
        if(parseInt(sessionStorage.getItem('monday')))
         {
            this.nbHeures += parseInt(sessionStorage.getItem('monday'));
            var d = new Date();
         d.setDate(d.getDate() - (d.getDay() + 6) % 7);
         console.log("date monday "+ d);
         }
         if(parseInt(sessionStorage.getItem('tuesday')))
         {
            this.nbHeures += parseInt(sessionStorage.getItem('tuesday'))
               var d = new Date();
         }
         if(parseInt(sessionStorage.getItem('wednesday')))
         {
            this.nbHeures += parseInt(sessionStorage.getItem('wednesday'))
         }
         if(parseInt(sessionStorage.getItem('thursday')))
         {
            this.nbHeures += parseInt(sessionStorage.getItem('thursday'))
         }
         if(parseInt(sessionStorage.getItem('friday')))
         {
            this.nbHeures += parseInt(sessionStorage.getItem('friday'))
         }
         if(parseInt(sessionStorage.getItem('saturday')))
         {
            this.nbHeures += parseInt(sessionStorage.getItem('saturday'))
         }
         if(parseInt(sessionStorage.getItem('sunday')))
         {
            this.nbHeures += parseInt(sessionStorage.getItem('sunday'))
         }
     }
     
     loadTasks(rId)
     {
            
            getTasks({ressourceId : rId })
			.then(result => {
                this.tasks = JSON.stringify(result);
                console.log("taskstaskstasks "+ result[0].Name);
                result.forEach(element => {
                    getProductionByTask({timesheet : this.recordId, task : element.Id})
                    .then(rslt=>{
                        console.log("getProductionByTask"+rslt);
                        
                        var dictProductions =[];
                        var key =0;
        
        var daysOfTheMonth =new Date( sessionStorage.getItem('timesheetYear'), sessionStorage.getItem('timesheetMonth'), 0).getDate();

                        rslt.forEach(production => {
                            dictProductions.length = 0;
                            var d = production.Date__c.split('-')[2];
                            var obj = {
                                jour : d,
                                duree : production.Duree__c,
                                tache : production.Tache__c
                            }
                            console.log("dictProductions"+obj.jour);
                            dictProductions.push(obj);
                        
                        });
                        console.log("dictProductions  " + dictProductions);
        
                        for(var i=1;i<=daysOfTheMonth;i++)
                        {
                            this.listProductions.push({
                                Date : i,
                                Value : 0,
                                key : '',
                                Tache :'' });
                        } 
                        for(var j=0; j<dictProductions.length;j++)
                            {
                                console.log(dictProductions.length);
                                this.listProductions[dictProductions[j].jour-1].Value= dictProductions[j].duree;
                                this.listProductions[dictProductions[j].jour-1].Key = dictProductions[j].jour;
                                this.listProductions[dictProductions[j].jour-1].Categorie = dictProductions[j].categorie;
                                this.valueCategorie= dictProductions[j].categorie;
                                console.log("this.internesList[dictProductions[j].jour-1]"+this.listProductions[dictProductions[j].jour-1].Value);
                            }
                            console.log("this.listProductions jour 13"+this.listProductions[13].Value);
                            if(dictProductions.length>0)
                            {
                                this.daysList.push(this.listProductions);
                                this.prods.push(this.listProductions);
                                this.myDict.push({ key : key , list : this.listProductions });
                                console.log("my dict"+this.myDict[key].list[0].Value+"***key"+key);
                               
                            }
                            key ++;
        
                    })
                    .catch(error=>{
                        console.log(error.message);
                    });
                    var obj = {
                        value : element.Id,
                        label : element.Name
                    };
                    this.productions.push(obj);
                });
                console.log("task combobox options "+this.productions);
			})
			.catch(error => {
                this.error = error;
                console.log(error);
            });
            getTasksNames({ressourceId : rId })
            .then(result => {
                this.taskNames = result;
            })
            .catch(error => {
                this.error = error;
                console.log(error);
            });
     }

    soumettre()
    {

        this.FeuilleDuTemps__c.Statut = "En Attente";
        console.log("done " +  this.FeuilleDuTemps__c);
    }

    handleProjectChange(event){
        console.log(event.detail.value);
        this.valueCategorie = 'Production';
       
    }
    
    handleCategorieChange(event)
    {
        console.log(event.detail.value);
        this.valueCategorie = event.detail.value;
        if(this.valueCategorie== 'Interne')
        {
            this.isProduction = false;
            this.isInterne = true;
        }
        else
        {
            this.isProduction = true ;
            this.isInterne = false;
        }
    }

    handleInterneChange(event)
    {
        this.interneValue = event.target.value;
        this.Interne.Categorie__c = this.interneValue;
    }

    handleProductionChange(event)
    {

        this.productionValue = event.target.value;
        console.log("handleProductionChange "+event.target.value);
        this.Production.Tache__c = this.productionValue;
              
    }
  
    changeViewHandler(event){
        if( event.detail.value == "mois")
        {
            this.weekView = false;
            this.monthView=true;
        }
        else{
            this.weekView = true;
            this.monthView=false;
        }
    }

  
    imprimer()
    {
        console.log("imprimer");
        this.hidePrint= true;
        window.print();
    }
    enregistrer()
    {

        var month = new Date().getMonth()+1;
        console.log("month"+ month);
        this.Feuille_Du_Temps__c.Id = this.recordId;
        this.Feuille_Du_Temps__c.Annee__c = sessionStorage.getItem('timesheetYear')
        this.Feuille_Du_Temps__c.Mois__c = sessionStorage.getItem('timesheetMonth');
        this.Feuille_Du_Temps__c.Total_Production__c = this.nbHeures;
        this.Feuille_Du_Temps__c.Ressource__c = sessionStorage.getItem('ressource');
        console.log("this.Feuille_Du_Temps__c.Ressource__c"+sessionStorage.getItem('ressource'));
       
        saveTimeSheet({timesheet : this.Feuille_Du_Temps__c })
        .then(result => {
        // Show success messsage
        console.log("save timesheet en cours....");
        sessionStorage.setItem('timesheetId', result.Id);
        console.log('timesheetId'+result.Id);
        this.dispatchEvent(new ShowToastEvent({
            title: 'Succès!!',
            message: 'Feuille du temps enregistrée avec succès!!',
            variant: 'success'
        }), );
    })
    .catch(error => {
        this.error = error.message;
        console.log("error");
        console.log(error.message)
        this.dispatchEvent(new ShowToastEvent({
            title: 'Erreur!!',
            message: 'Une erreur s\'est produite!!',
            variant: 'failure'
        }), );
    });
      
      this.liste.forEach(i => this.createInterneOrProduction(i));
       
     }

     createInterneOrProduction(i)
     {
        console.log("this.valueCategorie"+this.valueCategorie);
        console.log( "liste : "+this.liste);
        if(this.valueCategorie== 'Interne')
        {
            console.log("interne creation : timesheet id "+this.recordId);
            console.log("interne creation : timesheet id "+this.recordId);
            this.Interne.Feuille_Du_Temps__c = this.recordId;
            this.Interne.Date__c = i.date;
            console.log("interne date "+this.Interne.Date__c);
            this.Interne.Duree__c = i.value;
            //console.log("value" + i.value);

            var savedInterne = saveInterne({interne : this.Interne})
            .then(result => {
                console.log("interne saved");
            })
            .catch(error => {
                this.error = error.message;
                console.log("error");
                console.log(error.message)
            });
            this.Interne.Id = savedInterne.Id;
            console.log("savedInterne.Id;  "+savedInterne.Id);
            
        }
        
        if(this.valueCategorie== 'Production')
        {
            console.log("save production");
            this.Production.Date__c = i.date;
            this.Production.Feuille_Du_Temps__c = this.recordId;
            this.Production.Duree__c = i.value;
            saveProduction({production : this.Production})
            .then(result => {
                console.log("production created");
            })
            .catch(error => {
                this.error = error.message;
                console.log("error");
                console.log(error.message)
            });
            console.log("save production done");
        }

     }
     handleNbHeuresChange(event)
     {
         this.Feuille_Du_Temps__c.Total_Production__c =  this.totalProductions + this.totalInternes;
     }
     getPdf()
     {
         console.log("pdf");
     }
  
    handleDaysOfMonthChange(event)
    {
        console.log(event.target.dataset.id);
        var day = parseInt(event.target.dataset.id)+1;
        var d = new Date(sessionStorage.getItem('timesheetYear') , sessionStorage.getItem('timesheetMonth') , day);
        console.log(day);
        this.liste.push({date : d , value : parseInt(event.target.value) });
        console.log( "liste : "+this.liste);
    }
    addRow(){

        this.index++;
        var i = this.index;
        this.dayObj.key = i;
        this.daysList.push(JSON.parse(JSON.stringify(this.dayObj)));
        console.log('Enter ',this.daysList);
    }
    
    removeRow(event){
        this.isLoaded = true;
        var selectedRow = event.currentTarget;
        var key = selectedRow.dataset.id;
        if(this.daysList.length>1){
            this.daysList.splice(key, 1);
            this.index--;
            this.isLoaded = false;
        }else if(this.daysList.length == 1){
            this.daysList = [];
            this.index = 0;
            this.isLoaded = false;
        }
    }
}