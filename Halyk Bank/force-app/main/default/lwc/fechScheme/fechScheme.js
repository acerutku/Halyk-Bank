import { LightningElement, wire, api } from 'lwc';
import fetchCusTypeLocal from '@salesforce/apex/SelectSchemeController.fetchCusType';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import FdDetailLocal from '@salesforce/schema/FD_Detail__c';
import depTypeLocal from '@salesforce/schema/FD_Detail__c.Deposit_Type__c';
import payFreqLocal from '@salesforce/schema/FD_Detail__c.Payout_Frequency__c';

export default class FetchScheme extends LightningElement {
    @api recordId
    customerOptions = []
    selectedCusType = ''
    depTypeOptions = []
    selectedDepType = ''
    payFreqData
    payFreqOptions = []
    selectedPayFreq = ''

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
            console.log('Deposit Type bilgisi alınırken bir hata oluştu. Hata mesajı: ' + JSON.stringify(error));
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

}