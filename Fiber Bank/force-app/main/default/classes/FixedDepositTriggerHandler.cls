public class FixedDepositTriggerHandler {
    public static void populateRelOfficer(List<FD_Detail__c> fdList){
        //Branch_Relationship_Officer__c objectinde sorgulanacak branchlar belirlenir ve set in icine eklenir
        Set<String> branchNames = new Set<String>();
        for(FD_Detail__c fd:fdList){
            if(String.isNotBlank(fd.Branch__c)){
                branchNames.add(fd.Branch__c);
            }
        }
        
        //branchNames Set'inin karsiliklari olan Relationship Officer bilgileri soorgulanir
        List<Branch_Relationship_Officer__c> broList = new List<Branch_Relationship_Officer__c>();
        if(!branchNames.isEmpty()){
            broList = [SELECT Name, Branch_Name__c, Relationship_Officer__c 
                   FROM Branch_Relationship_Officer__c 
                   WHERE Branch_Name__c IN :branchNames];
        }
        //Branch ve relationship officer eslestirmesi yapilarak map icine eklenir
        Map<String, String> branchOfficers = new Map<String, String>();
        for(Branch_Relationship_Officer__c bro:broList){
            branchOfficers.put(bro.Branch_Name__c, bro.Relationship_Officer__c);
        }
        //Trigger i tetikleyen recordlarin relationship officer field i assign edilir
        for(FD_Detail__c fdToUpdate:fdList){
            if(String.isNotBlank(fdToUpdate.Branch__c)){
               fdToUpdate.Relationship_Officer__c = branchOfficers.get(fdToUpdate.Branch__c);
            }
        }
        
    }
    public static void shareWithRelOfficerAfterInsert(List<FD_Detail__c> fdList){
        
        List<FD_Detail__Share> fdShare = new List<FD_Detail__Share>();

        for (FD_Detail__c fd : fdList) {
            if(String.isNotBlank(fd.Relationship_Officer__c ) && fd.Relationship_Officer__c != fd.OwnerId){

                fdShare.add(createShareIns(fd.Id, fd.Relationship_Officer__c));
            }
        }
     //Dongu bittikten sonra share objecti insert edilir
        Database.insert(fdShare, false);
    }
    public static void shareWithRelOfficerAfterUpdate(List<FD_Detail__c> fdList, Map<Id, FD_Detail__c> fdOldMap){
       //Yeni relationship officer a yetki verilir
        List<FD_Detail__Share> fdShare = new List<FD_Detail__Share>();

        for (FD_Detail__c fd : fdList) {
            if(String.isNotBlank(fd.Relationship_Officer__c ) &&
            fd.Relationship_Officer__c != fd.OwnerId &&
            fd.Relationship_Officer__c != fdOldMap.get(fd.Id).Relationship_Officer__c){
  
                fdShare.add(createShareIns(fd.Id, fd.Relationship_Officer__c));

            }
            //eski relationship officer yetkisi kaldirilir
            List<FD_Detail__Share> fdsOld = [SELECT Id, Rowcause, ParentId, UserOrGroupId
                                             FROM FD_Detail__Share
                                             WHERE UserOrGroupId = :fdOldMap.get(fd.Id).Relationship_Officer__c
                                             AND ParentId = :fd.Id
                                             AND Rowcause = 'Manual'];
            if(!fdsOld.isEmpty()){
                Database.delete(fdsOld, false);
            }
        }
     //Dongu bittikten sonra share objecti insert edilir        
        Database.insert(fdShare, false);
    }
    private static FD_Detail__Share createShareIns(String recId, String userOrGroupId){
        FD_Detail__Share fds = new FD_Detail__Share();
        fds.ParentId = recId;
        fds.UserOrGroupId = userOrGroupId;
        fds.AccessLevel = 'Read';
        fds.RowCause = 'Manual'; 
        return fds;
    }
}