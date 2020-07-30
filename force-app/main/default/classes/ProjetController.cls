public with sharing class ProjetController {
    @AuraEnabled(Cacheable=true)
    public static List<Projet__c> getProjects(Id managerId) {
       
        return [SELECT Id, Name , Client__c, Date_debut__c, Date_Fin__c, Description__c, Manager__c
            FROM Projet__c 
            WHERE Manager__c = :managerId
             ];
    }

    @AuraEnabled(Cacheable=true)
    public static List<Client__c> getClientById(Id idClient) {
       
        return [SELECT Id, Name
            FROM Client__c 
            WHERE Id = :idClient
             LIMIT 1];
    }
}
