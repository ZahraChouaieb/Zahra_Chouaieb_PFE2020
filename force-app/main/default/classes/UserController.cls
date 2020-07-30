public with sharing class UserController {
    @AuraEnabled 
    public static user getUserDetail(){
        return [Select id,Name,SmallPhotoUrl, FullPhotoUrl
                From User
                Where Id =: Userinfo.getUserId()];
    }
}
