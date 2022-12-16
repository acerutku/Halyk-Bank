public without sharing class SelectSchemeController {
    
    @AuraEnabled (Cacheable=true)
    public static FD_Detail__c fetchCusType (String fdId){
        FD_Detail__c fdRec = [SELECT Id, Name, Customer_Type__c 
                                FROM FD_Detail__c
                                WHERE Id = :fdId];

        return fdRec;                      
    }
    @AuraEnabled (Cacheable=true)
    public static List<Interest_Scheme__c> fetchShemes(String cusType, String depType,
    Integer tnrDay, Integer tnrMonth, Integer fdAmount, String fdId){
        List<Interest_Scheme__c> listInt = [SELECT Id, Name, Customer_Type__c,
                                                   Deposit_Type__c, From_Amount__c,
                                                   To_Amount__c, Tenor_From_Months__c,
                                                   Tenor_To_Months__c, Tenor_From_Days__c, 
                                                   Tenor_To_Days__c, Interest_Rate__c
                                            FROM Interest_Scheme__c
                                            WHERE Customer_Type__c       =: cusType
                                            AND   Deposit_Type__c        =: depType
                                            AND    From_Amount__c       >=: fdAmount 
                                            AND    To_Amount__c         <=: fdAmount 
                                            AND    Tenor_From_Months__c >=: tnrMonth 
                                            AND    Tenor_To_Months__c   <=: tnrMonth 
                                            AND    Tenor_From_Days__c   >=: tnrDay   
                                            AND    Tenor_To_Days__c     <=: tnrDay];
      return  listInt;                            
    }
}