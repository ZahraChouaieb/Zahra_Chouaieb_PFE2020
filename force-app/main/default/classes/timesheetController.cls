
public with sharing class timesheetController {
    @AuraEnabled(Cacheable=true)
        public static List<Tache__c> getTasks(Id ressourceId) {
        
            System.debug(UserInfo.getUserId());
            return [SELECT Id,Name FROM Tache__c WHERE Ressource__c  = :ressourceId ] ;
    }

    @AuraEnabled(Cacheable=true)
        public static List<String> getTasksNames(Id ressourceId) {
        
            System.debug(UserInfo.getUserId());
            List<Tache__c>tasks = [SELECT Id,Name FROM Tache__c WHERE Ressource__c  = :ressourceId ] ;
            List<String> result = new List<String>();
            if(tasks.size()>0)
            {
                for (Tache__c task: tasks) {
                    result.add(task.Name);
                }
            }
            return result;
    }
    @AuraEnabled(Cacheable=true)

        public static Ressource__c getCurrentRessource() {

            return [SELECT Id FROM Ressource__c WHERE Compte_Utilisateur__c  =: UserInfo.getUserId() ] ;
    }
    
    // public static String getMonth(Integer mois)
    // {
    //     String month;
    //     switch on mois  {
    //         when 1 {
    //             month = 'Janvier';
    //         }
    //         when 2 {
    //             month = 'Février';
    //         }
    //         when 3 {
    //             month = 'Mars';
    //         }
    //         when 4 {
    //             month = 'Avril';
    //         }
    //         when 5 {
    //             month = 'Mai';
    //         }
    //         when 6 {
    //             month = 'Juin';
    //         }
    //         when 7 {
    //             month = 'Juillet';
    //         }
    //         when 8 {
    //             month = 'Aout';
    //         }

    //         when 9 {
    //             month = 'Septembre';
    //         }
    //         when 10 {
    //             month = 'Octobre';
    //         }
    //         when 11 {
    //             month = 'Novembre';
    //         }
    //         when else {
    //             month = 'Décembre';
    //         }
    //     }
    //         return month;
    // }
@AuraEnabled(Cacheable=true)

        public static List<AggregateResult> getInterneCategorie(Id timesheet ) {
            return [SELECT Categorie__c FROM Interne__c where Feuille_Du_Temps__c =:timesheet GROUP BY Categorie__c ] ;
        }
        @AuraEnabled(Cacheable=true)

        public static List<Interne__c> getInterneByCategorie(Id timesheet ,Integer month , String categorie) {
            List<Interne__c> result;
            try{
                //Feuille_Du_Temps__c[] timesheet = getTimesheetByMonth(ressourceId , month.format());
                result = [SELECT Date__c, CreatedDate,Duree__c,Id FROM Interne__c where Feuille_Du_Temps__c =:timesheet and Categorie__c=:categorie  order by CreatedDate] ;
            }
            catch (Exception ex) {
                //throw new AuraHandledException(ex.getMessage()); 
                //return null;
                System.debug(ex.getMessage());
            }
            return result;
    }
    @AuraEnabled(Cacheable=true)

        public static List<Interne__c> getInterne(Id timesheet ,Integer month) {
            List<Interne__c> result;
            try{
                //Feuille_Du_Temps__c[] timesheet = getTimesheetByMonth(ressourceId , month.format());
                result = [SELECT Date__c, CreatedDate,Duree__c,Id FROM Interne__c where Feuille_Du_Temps__c =:timesheet order by CreatedDate] ;
            }
            catch (Exception ex) {
                //throw new AuraHandledException(ex.getMessage()); 
                System.debug(ex.getMessage());
                //return null;
            }
            return result;
    }

    @AuraEnabled(Cacheable=true)

        public static List<Production__c> getProduction(Id timesheet ) {

            return [SELECT CreatedDate,Date__c,Duree__c,Id,Tache__c FROM Production__c where Feuille_Du_Temps__c =:timesheet order by CreatedDate] ;
    }
    @AuraEnabled(Cacheable=true)

    public static List<Production__c> getProductionByTask(Id timesheet ,String task  ) {
        //Map<Id,Production__c> map = new Map<Id,Production__c>() ;
        return[SELECT Date__c,Duree__c,Id,Tache__c FROM Production__c where Feuille_Du_Temps__c =:timesheet and Tache__c =:task order by CreatedDate];

}



    @AuraEnabled
    public static Feuille_Du_Temps__c createTimeSheet(Feuille_Du_Temps__c timesheet){
        Feuille_Du_Temps__c sheet = new Feuille_Du_Temps__c();
        try {
        sheet.Ressource__c = timesheet.Ressource__c;
        sheet.Mois__c = timesheet.Mois__c;
        sheet.Annee__c = timesheet.Annee__c;
        //sheet.Name = timesheet.Name;
        sheet.Total_Production__c = timesheet.Total_Production__c;
        sheet.Total_Absence__c	 = timesheet.Total_Absence__c;
        insert sheet;
        } catch (Exception ex) {
            System.debug(ex.getMessage());
        }  
        return sheet;     
    }
    @AuraEnabled
    public static Feuille_Du_Temps__c saveTimeSheet(Feuille_Du_Temps__c timesheet)
    {
       // List<Feuille_Du_Temps__c> result = [SELECT Id  FROM Feuille_Du_Temps__c WHERE Id  =:timesheet.Id];
       // Feuille_Du_Temps__c result =getTimesheetByMonth(timesheet.Ressource__c , Integer.valueOf(timesheet.Mois__c));
        Feuille_Du_Temps__c[] result =getTimesheetByMonth(timesheet.Id);
        System.debug(result);

        if( result.size() < 0)
        {
            System.debug('***null');
            //timesheet.Statut__c = 'En Attente';
            return createTimeSheet(timesheet);
            //System.debug('created timesheet'+createTimeSheet(timesheet));
        }
        else {
            System.debug('***update');
            return updateTimeSheet(timesheet);
        }

    }

    @AuraEnabled
    public static Feuille_Du_Temps__c[] getTimesheetByMonth(Id id ){
        return [SELECT Id, Mois__c, Annee__c, Ressource__c FROM Feuille_Du_Temps__c WHERE Id  =:id ] ;     
    }
    @AuraEnabled
    public static Feuille_Du_Temps__c updateTimeSheet(Feuille_Du_Temps__c timesheet){
        
        Feuille_Du_Temps__c[] sheet= getTimesheetByMonth(timesheet.Id);
       
        try {
            sheet[0].Total_Production__c = timesheet.Total_Production__c;
            //sheet[0].Statut__c = timesheet.Statut__c;
            Feuille_Du_Temps__c f = sheet[0];
            update f;
            return f;
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage()+'error updating timesheet'); 
            
        }   
        
    }

    @AuraEnabled
    public static Interne__c createInterne(Interne__c interne){
        Interne__c i = new Interne__c();
        try {
            i.Date__c = interne.Date__c;
            i.Duree__c = interne.Duree__c;
            i.Feuille_Du_Temps__c= interne.Feuille_Du_Temps__c;
            i.Categorie__c = interne.Categorie__c;
            insert i;
            //return i;
        } catch (Exception ex) {
            //throw new AuraHandledException(ex.getMessage()); 
            System.debug('error creating interne');
            System.debug(ex.getMessage());
            //return null;
        }   
        return i;    
    }

    @AuraEnabled
    public static Interne__c saveInterne(Interne__c interne){
        Interne__c[] result = [SELECT Id
        FROM Interne__c 
        WHERE Date__c = :interne.Date__c and Categorie__c = :interne.Categorie__c];
        System.debug(result);
        if(result.size() < 0)
        {
            System.debug('updateInterne');
            return updateInterne(interne);
            
        }
        else {
            System.debug('createInterne');
            return createInterne(interne);
        }
    }
    @AuraEnabled
    public static void saveProduction(Production__c production){
        System.debug('saveProduction');

        Production__c[] result = [SELECT Id
        FROM Production__c 
        WHERE Date__c = :production.Date__c and Tache__c = :production.Tache__c];
        System.debug(result);
        if(result.size() < 0)
        {
            System.debug('update prod');
            updateProduction(production);
            
        }
        else {
            System.debug('createProd');
            createProduction(production);
        }
    }
    

    @AuraEnabled
    public static Production__c createProduction(Production__c production){
        try {
            insert production;
            return production;
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage()); 
        }       
    }
    @AuraEnabled
    public static Interne__c updateInterne( Interne__c interne){
        Interne__c[] result = [SELECT Id, Duree__c
        FROM Interne__c 
        WHERE Date__c = :interne.Date__c and Categorie__c = :interne.Categorie__c];
        
        if(result.size()>0)
        {
            result[0].Duree__c = interne.Duree__c;
            update result[0];
            
        }
        else {
            System.debug('update does not work');
        }
        return result[0];
        
    }
    @AuraEnabled
    public static void updateProduction( Production__c production){
        Production__c[] result = [SELECT Id, Duree__c
        FROM Production__c 
        WHERE Date__c = :production.Date__c and Tache__c = :production.Tache__c];
        
        if(result.size()>0)
        {
            result[0].Duree__c = production.Duree__c;
            update result[0];
        }
        else {
            System.debug('update does not work');
        }
        
    }
   
    @AuraEnabled(Cacheable=true)
    public static List<Feuille_Du_Temps__c> getTimesheetByRessourceId(Id ressourceId) {
       
        return [SELECT Id, Name, Date_Creation__c,Mois__c, count(Mois__c), Annee__c 
            FROM Feuille_Du_Temps__c 
            WHERE Ressource__c = :ressourceId
            ORDER BY Mois__c DESC NULLS LAST
             ];
    }
    @AuraEnabled(Cacheable=true)
    public static Integer totalProduction(Id timesheetId) {
        Integer result = 0;
        List<Production__c> prod = [SELECT Duree__c FROM Production__c where Feuille_Du_Temps__c =:timesheetId ] ;
        for (Production__c p: prod) {
            result+=integer.valueOf(p.Duree__c) ;
        }
        return result;

    }
    @AuraEnabled(Cacheable=true)
    public static Integer totalInterne(Id timesheetId) {
        Integer result = 0;
        List<Interne__c> interne = [SELECT Duree__c FROM Interne__c where Feuille_Du_Temps__c =:timesheetId ] ;
        for (Interne__c i: interne) {
            result+=integer.valueOf(i.Duree__c) ;
        }
        return result;

    }
    @AuraEnabled(Cacheable=true)
    public static String getMonth(Id timesheetId) {
        Feuille_Du_Temps__c timesheet = [SELECT Mois__c  FROM Feuille_Du_Temps__c WHERE Id  =:timesheetId ] ; 
        String result ='' ;
        if(timesheet!= null)
        {
            result = timesheet.Mois__c;
        }
        return result;


    }
    @AuraEnabled(Cacheable=true)
    public static List<Tache__c> getTaskByName(String taskName) {
        //System.debug('getTaskByName' + taskName);
       
        return [SELECT Id,Name FROM Tache__c WHERE Name =:taskName];
    }

    
     
}

