public  with sharing class AbsencesController {
    @AuraEnabled
    public static void createAbsence(Conge__c conge){
        Integer duree = conge.Date_Debut__c.daysBetween(conge.Date_Fin__c);
        System.debug('duree' + duree);
        conge.Duree__c = duree;
        try {
            insert conge;
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage()); 
        }       
    }
    @AuraEnabled
    public static void updateAbsence(Conge__c conge){
        Integer duree = conge.Date_Debut__c.daysBetween(conge.Date_Fin__c);
        System.debug('duree' + duree);
        conge.Duree__c = duree;
        try {
            update conge;
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage()); 
        }       
    }
    
     @AuraEnabled(Cacheable=true)
    public static Conge__c[] getAllAbsences( Id ressourceId) {
        return [SELECT Id, Name, Duree__c ,Date_debut__c, Date_Fin__c, Statut__c ,Type__c, Justification__c
            FROM Conge__c WHERE Ressource__c = :ressourceId LIMIT 50];
    }
    @AuraEnabled(Cacheable=true)
    public static Conge__c[] getAbsenceById(Id absenceId) {
        return [SELECT Id, Name, Duree__c ,Date_debut__c, Date_Fin__c, Statut__c ,Type__c, Justification__c
            FROM Conge__c  WHERE Id = : absenceId LIMIT 1];
    }
    @AuraEnabled(Cacheable=true)
    public static Conge__c[] getAbsenceByMonth(Id ressourceId , Integer month ) {
        
        list<Conge__c> liste = [SELECT Id, Duree__c ,Date_debut__c, Date_Fin__c
            FROM Conge__c  WHERE Ressource__c = : ressourceId  ];
            list<Conge__c> result = new list<Conge__c>();
            for (Conge__c c: liste) {
                if(c.Date_debut__c.month()== month)
                {
                    result.add(c);
                }
            }
            return result;
    }

  
    @AuraEnabled(cacheable=true)
    public static Conge__c[] getStatus()
    {
        return [SELECT Id ,Statut__c 
        FROM Conge__c  LIMIT 50];
    }
    @AuraEnabled(Cacheable=true)
    public static Integer totalAbsence(Id ressourceId , Integer month) {
        Integer result = 0;
        List<Conge__c> conge = [SELECT Duree__c,Date_debut__c FROM Conge__c where Ressource__c =:ressourceId ] ;
        for (Conge__c c: conge) {
            if(c.Date_debut__c.month()== month)
            {
                result+= integer.valueOf(c.Duree__c);
            }
        }
        return result;

    }
}