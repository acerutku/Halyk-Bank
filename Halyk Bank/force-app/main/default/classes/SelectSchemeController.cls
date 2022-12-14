public without sharing class SelectSchemeController {
    
    @AuraEnabled (Cacheable=true)
    public static FD_Detail__c fetchCusType (String fdId){
        FD_Detail__c fdRec = [SELECT Id, Name, Customer_Type__c 
                                FROM FD_Detail__c
                                WHERE Id = :fdId];

        return fdRec;                      
    }
    @AuraEnabled (Cacheable=true)
    public static List<Interest_Scheme__c> fetchShemes(String cusType, String depType, Integer tnrDay, Integer tnrMonth, Integer fdAmount, String fdId){
       
        List<Interest_Scheme__c> listInt = [SELECT Id, Name, Customer_Type__c, Deposit_Type__c, From_Amount__c, To_Amount__c, Tenor_From_Months__c, Tenor_To_Months__c, Tenor_From_Days__c, Tenor_To_Days__c, Interest_Rate__c
                                            FROM Interest_Scheme__c
                                            WHERE Customer_Type__c = :cusType
                                            AND Deposit_Type__c = :depType
                                            AND From_Amount__c <= :fdAmount  
                                            AND To_Amount__c >= :fdAmount 
                                            AND Tenor_From_Months__c <= :tnrMonth 
                                            AND Tenor_To_Months__c >= :tnrMonth 
                                            AND Tenor_From_Days__c <= :tnrDay 
                                            AND Tenor_To_Days__c >= :tnrDay ];

        return listInt;
    }
    @AuraEnabled
    public static void updateFD(String depType, Integer tnrDay, Integer tnrMonth, Integer fdAmount, String fdId, String payFreq, Decimal intRate,String schmId){

        FD_Detail__c fdRec = new FD_Detail__c();
        fdRec.Id = fdId;
        fdRec.Deposit_Type__c = depType;
        fdRec.Tenor_in_days__c = tnrDay;
        fdRec.Tenor_in_months__c = tnrMonth;
        fdRec.FD_Amount__c = fdAmount;
        fdRec.Payout_Frequency__c = payFreq;
        fdRec.Interest_Scheme__c = schmId;
        fdRec.Interest_Rate__c = intRate;

        update fdRec;
    }
}