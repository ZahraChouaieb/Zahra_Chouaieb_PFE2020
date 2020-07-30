public with sharing class TacheController {

    @AuraEnabled(Cacheable=true)
    public static Tache__c[] getAllTasks() {
        return [SELECT Id, Name, Projet__c, Ressource__c, Description__c ,Production__c
            FROM Tache__c  LIMIT 50];
    }

    @AuraEnabled(Cacheable=true)
    public static List<Tache__c> getTaskById(Id ressourceId) {
       
        return [SELECT Id, Name, Projet__c, Ressource__c, Description__c ,Production__c
            FROM Tache__c 
            WHERE Ressource__c = :ressourceId
             LIMIT 50];
    }
    @AuraEnabled(Cacheable=true)
    public static List<Tache__c> getTaskByManager(Id ManagerId) {
       
        return [SELECT Id, Name, Projet__c, Ressource__c, Description__c ,Production__c
            FROM Tache__c 
            WHERE Ressource__c = :ressourceId
             LIMIT 50];
    }
    
   

    @AuraEnabled(Cacheable=true)
    public static List<Projet__c> getProjectById(Id id) {
       
        return [SELECT Id, Name
            FROM Projet__c 
            WHERE Id = :id
             LIMIT 1];
    }
    @AuraEnabled(Cacheable=true)
    public static List<Projet__c> getProjects(Id managerId) {
       
        return [SELECT Id, Name , Client__c,Date_debut__c,Date_Fin__c,Description__c,Responsable__c
            FROM Projet__c 
            WHERE Manager__c = :managerId
             LIMIT 1];
    }

}
