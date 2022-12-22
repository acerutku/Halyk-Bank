import { LightningElement, wire, api } from 'lwc';
import fetchCusTypeLocal from '@salesforce/apex/SelectSchemeController.fetchCusType';
import interestSchmFetch from '@salesforce/apex/SelectSchemeController.fetchShemes';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import FdDetailLocal from '@salesforce/schema/FD_Detail__c';
import depTypeLocal from '@salesforce/schema/FD_Detail__c.Deposit_Type__c';
import payFreqLocal from '@salesforce/schema/FD_Detail__c.Payout_Frequency__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FetchScheme extends LightningElement {
    @api recordId
    customerOptions = []
    selectedCusType = ''
    depTypeOptions = []
    selectedDepType = ''
    payFreqData
    payFreqOptions = []
    selectedPayFreq = ''
    tenorInMonth = ''
    tenorInDay = ''
    fdAmount = 0
    listScheme = []
    selectedIntRate
    selectedIntSchmId
    // fetchCusTypeLocal metotu ile Apex'de yaptığımız sorgu sonucunda Müşterinin Customer type bilgisi alındı ve CUSTOMER TYPE
    @wire(fetchCusTypeLocal, { 
        fdId:'$recordId'
    }) wiredData({ data, error }) {
        if (data) {
            let options = [];
            options.push({ label: data.Customer_Type__c, value: data.Customer_Type__c })
            this.customerOptions = options;
        } else if (error) {
            console.log('Customer Type bilgisi alinirken bir hata oluştu. Hata mesaji: ' + JSON.stringify(error));
        }
    }
    cusTypeChange(event) {
        this.selectedCusType = event.detail.value
    }

    // DEPOSIT TYPE
    @wire(getObjectInfo, { objectApiName: FdDetailLocal })
    fdObjectInfo;
    
    @wire(getPicklistValues, { recordTypeId: '$fdObjectInfo.data.defaultRecordTypeId', fieldApiName: depTypeLocal })
    wiredDataDep({ data, error }) {
        if (data) {
            let options = [];
            data.values.forEach(element => {
                options.push({ label: element.label, value: element.value})
            });
            
            this.depTypeOptions = options;
        } else if (error) {
            console.log('Deposit Type bilgisi alinirken bir hata oluştu. Hata mesajı: ' + JSON.stringify(error));
        }
    };
    
    depTypeChange(event) {
        this.selectedDepType = event.detail.value
        // Deposit Type ile Fayout Frequency arasında field dependency oluşturmak için aşağıdaki kod eklendi
        let key = this.payFreqData.controllerValues[event.detail.value]
        this.payFreqOptions = this.payFreqData.values.filter(opt=>opt.validFor.includes(key))
    }

    // Payout Frequency
    @wire(getPicklistValues, { recordTypeId: '$fdObjectInfo.data.defaultRecordTypeId', fieldApiName: payFreqLocal })
    wiredDataPay({ data, error }) {
        if (data) {
            this.payFreqData = data

        } else if (error) {
            console.log('Fayout Frequency bilgisi alinirken bir hata oluştu. Hata mesaji: ' + JSON.stringify(error));
        }
    };

    payFreqChange(event) {
        this.selectedPayFreq = event.detail.value
    }

    // Tenor in Month
    get tenorMonthOptions() {
        let options = []
        for (var i = 0; i < 85;i++){
            options.push({label:i.toString(), value:i.toString()})
        }
        return options
    }

    tenorMonthChange(event) {
        this.tenorInMonth = event.detail.value
    }

    // Tenor in Days
    get tenorDayOptions() {
        let options = []
        for (var i = 0; i < 30;i++){
            options.push({label:i.toString(), value:i.toString()})
        }
        return options
    }

    tenorDayChange(event) {
        this.tenorInDay = event.detail.value
    }

    // FD Amount
    fdAmountChange(event) {
        this.fdAmount = event.detail.value
    }

    // Fetch Scheme Button
    fetchScheme(event) {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.clsFrmFetchSchm');
        inputFields.forEach(inputField => {
            // Validation Hatası var, isValid=false
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
    // Field Validation OK
        if (isValid) {
            interestSchmFetch({
                cusType:this.selectedCusType,
                depType:this.selectedDepType,
                tnrDay:this.tenorInDay,
                tnrMonth:this.tenorInMonth,
                fdAmount:this.fdAmount,
                fdId:this.recordId
            }).then(result => {
                var lstSchm = []
                if (result) {
                    for (var i = 0; i < result.length; i++){
                        var tempObj = {}
                        tempObj.label = result[i].Name
                        tempObj.value = result[i].Id
                        tempObj.interestRate = result[i].Interest_Rate__c
                        lstSchm.push(tempObj)
                    }
                }
                this.listScheme = lstSchm
            }).catch(error => {
                console.log('Scheme Datasi çekilirken hata oluştu. Hata Mesaji= ' + error.message)
            })
        }

    }
    schmeChange(event){
        var shemeRecId = event.detail.value
        for(var i = 0; i< this.listScheme.length; i++){
            if(shemeRecId == this.listScheme[i].value){
                this.selectedIntRate = this.listScheme[i].interestRate
                this.selectedIntSchmId = schemeRecId
            }
        }
    }
 // SAVE BUTTON
 saveClick(event) {
    // İlk altı input validation
let isValid = true;
let inputFields = this.template.querySelectorAll('.clsFrmFetchSchm');
inputFields.forEach(inputField => {
    // Validation Hatası var, isValid=false
    if (!inputField.checkValidity()) {
        inputField.reportValidity();
        isValid = false;
    }
});

    // Interest Scheme ve Int Rate Validation
inputFields = this.template.querySelectorAll('.classForSaveButton');
inputFields.forEach(inputField => {
    // Validation Hatası var, isValid=false
    if (!inputField.checkValidity()) {
        inputField.reportValidity();
        isValid = false;
    }
});

if (isValid) {
    // Call Apex Method to update FD Record
    updateFD({
        depType:this.selectedDepType,
        tnrDay:this.tenorInDay,
        tnrMonth:this.tenorInMonth,
        fdAmount:this.fdAmount,
        fdId: this.recordId,
        payFreq: this.selectedPayFreq,
        intRate: this.selectedIntRate,
        schmId: this.selectedIntSchmId
    }).then(result => {
            const event = new ShowToastEvent({
                title: 'Success',
                message:
                    'Registration Successfull',
                variant:'Success'    
            });
            this.dispatchEvent(event);
        
    }).catch(error => {
        const event = new ShowToastEvent({
            title: 'Failed',
            message:
                'Registration Failed' + error.message,
            variant:'Error'    
        });
        this.dispatchEvent(event);
    })
}
}

}