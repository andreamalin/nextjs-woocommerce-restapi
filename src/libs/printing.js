function testClick() {
    document.getElementById("title").innerHTML = "funciona on click"
}

function toPrice(price) {
    if (!price) return "";
    return Number.parseFloat(price).toFixed(2);
}

function truncate(input, len) {
    if (input.length > len) {
        return input.substring(0, len) + "...";
    }
    return input;
}

function openPort(baudRate) {
    var printerPort = "PRINTERPORT1";
    var option = null;

    option = {
        baudRate: parseInt(baudRate),
        parity: "NONE",
        dataBits: "BITS8",
        stopBits: "1",
    };

    var result = false;

    function onlistener(printSerialData) {
        console.log(
            "Print serial data is " +
            printSerialData.data +
            ", Print serial Port is === " +
            printSerialData.result
        );
    }

    try {
        result = b2bapis.serialprint.open(printerPort, option, onlistener);
        if (result === true) {
            console.log("Printer port opened successfully");
        } else {
            console.log("Error opening printer port");
        }
    } catch (e) {
        console.log("[open] call sysFunction exception" + e.errorMessage);
    }
}

function closePort() {
    var printerPort = "PRINTERPORT1";

    var result = false;
    try {
        result = b2bapis.serialprint.close(printerPort);
        if (result === false) {
            console.log("Error closing port");
        }
    } catch (e) {
        console.log(
            "[close] call syncFunction exception " +
            e.code +
            " " +
            e.errorName +
            " " +
            e.errorMessage
        );
    }
}

var currencySymbol = '';
export function printOrder(items, totalPrice) {
    var currentdate = new Date(); 
    var datetime =  currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();

    let message = {
        "OrderNo": "1",
        "PaymentDisplayName": "Efectivo",
        "ReceiptItemGroups": [],
        "ServiceFee": 0,
        "ShowReceiptItemGroupsonReceipts": "False",
        "ShowSurveyLinkOnReceipt": false,
        "SurveyCode": "",
        "SurveyLink": "",
        "address1": "Samsung Experience Store Oakland",
        "address2": "Guatemala City, Guatemala ",
        "baudRate": "115200",
        "branchContactNo": "50223784600",
        "branchName": "Samsung",
        "branchTagline": "",
        "cardNumber": "",
        "cardType": "",
        "copyType": "COPIA DEL CLIENTE",
        "currencySymbol": "Q",
        "customerEmail": "",
        "customerName": "",
        "customerPhone": "",
        "date": datetime,
        "discount": 0,
        "doNotPrintOrderToken": "False",
        "footerText": "",
        "footerTextMerchant": "",
        "headerText": "",
        "invoiceNotodb": "54969062",
        "isRefund": false,
        "isRemovePricingAndPayments": false,
        "isTableTent": "False",
        "isTaxHidden": false,
        "orderType": "PAGAR EN CAJA",
        "prefix": "",
        "promo": 0,
        "promotionIsTotal": false,
        "reward": 0,
        "rewardBottomTextEarnPoint": "",
        "rewardBottomTextRedeemPoints": "",
        "rewardBottomTextTotalPoints": "",
        "rewardBottomTextVisitCount": "",
        "rewardRedeem": "",
        "rewardRedeemDiscountAmout": "",
        "shippingFee": 0,
        "shouldPrintCustomerPrint": true,
        "showDefaultModifiers": "True",
        "showNegativeModifiers": "False",
        "subtotal": totalPrice,
        "tableTentNumber": "",
        "tax": 0.12,
        "taxType": "1",
        "thankYouMessage": "",
        "thirdPartyOrderId": "",
        "tip": 0,
        "together": "False",
        "total": totalPrice + totalPrice*0.12
    }

    let finalItems = []
    items.forEach((item => {
        finalItems.push(
            {
                "ItemID": item.product_id,
                "Name": item.data.name,
                "DisplayName": item.data.name,
                "OrderReviewDisplayName": "",
                "Price": item.data.price,
                "WeightUnitID": "",
                "EnablePricebyWeight": "False",
                "DisplayOrder": 2,
                "Quantity": item.quantity,
                "IsCombo": false
            }
        )
    }))
    message.items = finalItems

    console.log(message);

    var printerPort = "PRINTERPORT1";
    var baudRate = message.baudRate;
    currencySymbol = message.currencySymbol;
    openPort(baudRate);

    var result = false;
    var data = "";
    var receiptData = "";
    isRemovePricing = message.isRemovePricingAndPayments;
    isRemovePricing = (isRemovePricing && isRemovePricing != undefined) ? isRemovePricing : message.isRemovePricing;
    isTaxHidden = message.isTaxHidden
    if (isRemovePricing) {
        itemSpaceReciept = 36;
        eachPriceSpace = 0;
        totalPriceSpace = 0;
    } else {
        itemSpaceReciept = 15;
        eachPriceSpace = 9;
        totalPriceSpace = 12;
    }

    if (message.universal) {
        receiptData = formatData(message);
        data += stringToHex(receiptData);
    } else {

        if (message.doNotPrintOrderToken == 'False') {
            var tokenPrint = tokenTicket(message);
            if (message.together == "False") {
                data += tokenPrint;
            }
        }

        receiptData = makeReceipt(message);

        if (message.shouldPrintCustomerPrint) {
            data += receiptData;
        }


    }

    // data += stringToHex(receiptData);

    try {
        let recString = hex2a(data);
        console.log(recString);
    }
    catch (e) {

    }

    try {
        result = b2bapis.serialprint.writeData(printerPort, data, data.length);
        console.log("[writeData_0] writeData size is " + result);
        sendPrintSuccess();
    } catch (e) {
        console.log(
            "[writeData] call syncFunction exception " + e.name + " " + e.message
        );
        sendPrintFailure();
    }

    closePort();
}


function sendPrintFailure() {
    var message = {
        data: {
            messageType: "CustomerPrinterReturn",
            result: "failure",
        },
    };
}

function sendPrintSuccess() {
    var message = {
        messageType: "CustomerPrinterReturn",
        result: "success",
    };
}

function makeItemwise(data) {
    var d = new Date();
    let itemList = "";
    data.forEach((itemwise) => {
        itemList +=
            lineSpacing(
                itemwise.Quantity,
                truncate(itemwise.ItemName, 23),
                isRemovePricing ? "" : toPrice(itemwise.ItemTotal),
                isRemovePricing ? "" : toPrice(parseFloat(itemwise.ItemTotal) * itemwise.Quantity)
            ) + "\n";
    });
    var receiptData =
        "                                          \n" +
        center("--ITEM SALES REPORT--") +
        "\n" +
        center(d.toLocaleString("en-US")) +
        "\n" +
        "******************************************\n" +
        "                                  \n" +
        (isRemovePricing ? "QTY    ITEM                               \n" : "QTY    ITEM                EACH    TOTAL  \n") +
        "******************************************\n" +
        "                                  \n" +
        itemList +
        "******************************************\n" +
        "\n\n\n\n\n";
    console.log("item-wise receipt data", receiptData);
    return receiptData;
}

function makeZReport(data) {
    var d = new Date();
    let itemList = "";
    let receiptData =
        "                                          \n" +
        center("--Z Report--") +
        "\n" +
        center(d.toLocaleString("en-US")) +
        "\n******************************************\n" +
        "Order Summary\n\n" +
        zReportLineSpacing("Gross Sales:", data.TotalGrossSales) +
        "\n" +
        zReportLineSpacing("Discounts & Loyalty:", data.TotalDiscounts) +
        "\n" +
        zReportLineSpacing("Refunds:", data.TotalRefunds) +
        "\n" +
        zReportLineSpacing("Net Sales:", data.TotalNetSales) +
        "\n" +
        zReportLineSpacing("Fees", data.TotalFees) +
        "\n" +
        zReportLineSpacing("Taxes:", data.TotalTaxes) +
        "\n" +
        zReportLineSpacing("Tips:", data.TotalTips) +
        "\n" +
        zReportLineSpacing("Amount Collected:", data.AmmountCollected) +
        "\n" +
        zReportLineSpacing("Open(Unpaid Orders:", data.OpenOrders) +
        "\n\n******************************************\n" +
        "Payment Types\n\n" +
        zReportLineSpacing("Total Orders:", data.TotalOrders) +
        "\n" +
        zReportLineSpacing("Total Cash Orders:", data.TotalCashOrders) +
        "\n" +
        zReportLineSpacing("Total Credit Orders:", data.TotalCreditOrders) +
        "\n" +
        zReportLineSpacing("Total Cash:", data.TotalCash) +
        "\n" +
        zReportLineSpacing("Total Credit:", data.TotalCredit) +
        "\n\n******************************************\n" +
        "Channel Sales\n\n" +
        zReportLineSpacing("Kiosk Sales:", data.KioskSales) +
        "\n\n******************************************\n" +
        "Other Payment Types Summary\n\n" +
        zReportLineSpacing("Total Tender Orders:", data.TotalTenderOrders) +
        "\n" +
        zReportLineSpacing(
            "Total Tender Order Net Sales:",
            data.TotalTenderNetSales
        ) +
        "\n" +
        zReportLineSpacing("Total Tender Order Taxes", data.TotalTenderOrderTaxes) +
        "\n" +
        zReportLineSpacing("Total Tender Order Tips:", data.TotalTenderOrderTips) +
        "\n" +
        zReportLineSpacing("Total Tender Order Fees:", data.TotalTenderOrderFees) +
        "\n" +
        zReportLineSpacing(
            "Total Tender Gross Sales:",
            data.TotalTenderGrossSales
        ) +
        "\n" +
        zReportLineSpacing("Total House Orders:", data.TotalHouseOrders) +
        "\n" +
        zReportLineSpacing("Total House Net Sales:", data.TotalHouseNetSales) +
        "\n" +
        zReportLineSpacing("Total House Order Taxes:", data.TotalHouseOrderTaxes) +
        "\n" +
        zReportLineSpacing("Total House Order Tips:", data.TotalHouseOrderTips) +
        "\n" +
        zReportLineSpacing("Total House Order Fees:", data.TotalHouseOrderFees) +
        "\n" +
        zReportLineSpacing("Total House Gross Sales:", data.TotalHouseGrossSales) +
        "\n" +
        zReportLineSpacing("Total Net Other Orders:", data.TotalNetOtherOrders) +
        "\n\n******************************************\n" +
        "Fees Summary\n\n" +
        zReportLineSpacing("Total Non Cash Fees:", data.TotalNonCashFees) +
        "\n\n******************************************\n" +
        "Discount & Loyalty Summary\n\n" +
        zReportLineSpacing("Order Discounts:", data.OrderDiscounts) +
        "\n" +
        zReportLineSpacing("Loyalty Discounts:", data.LoyaltyDiscounts) +
        "\n" +
        zReportLineSpacing("Total Discounts:", data.TotalDiscounts) +
        "\n" +
        zReportLineSpacing(
            "Total Gift Card Redemptions:",
            data.TotalGiftCardRedemptions
        ) +
        "\n" +
        zReportLineSpacing("Complimentary:", data.Complimentary) +
        "\n\n******************************************\n" +
        "Canceled Orders Summary\n\n" +
        zReportLineSpacing("Total Refunds:", data.TotalRefunds) +
        "\n" +
        zReportLineSpacing("Total:", data.TotalCanceledOrdersSummary) +
        "\n\n******************************************\n" +
        "Tip Summary\n\n" +
        zReportLineSpacing("Cash Tips:", data.CashTips) +
        "\n" +
        zReportLineSpacing("Credit Card Tips:", data.CreditCardTips) +
        "\n" +
        zReportLineSpacing("Tender Tips:", data.TenderTips) +
        "\n" +
        zReportLineSpacing("House Tips:", data.HouseTips) +
        "\n" +
        zReportLineSpacing("Total Tips:", data.TotalTips) +
        "\n\n\n\n\n\n\n\n";
    console.log(receiptData);
    return receiptData;
}

function formatData(message) {
    let type = message.payload.type;

    if (type == "Itemwise") {
        return makeItemwise(message.payload.data);
    } else if (type == "ZReport") {
        return makeZReport(message.payload.data);
    }
}

var qtySpace = 6;
var itemSpaceReciept = 15;
var eachPriceSpace = 9;
var totalPriceSpace = 12;
var isRemovePricing = false;
var isTaxHidden = false;

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function getItemMarkup(items, taxType = "", showNegativeModifiers, showDefaultModifiers) {
    var itemsList = "";

    for (const item of items) {
        var eachPrice = (parseFloat(item.Price)).toFixed(2);

        var oneItem = ``
        var totalPrice = (parseFloat(item.Quantity) * eachPrice).toFixed(2);
        oneItem += "1B4501";
        if (((eachPrice != '' && eachPrice != '0' && eachPrice != '0.00')||item.IsLoyaltyDiscountItem) && !isRemovePricing) {
oneItem += stringToHex(setAllignedText(item.EnablePricebyWeight ? item.EnablePricebyWeight.toLowerCase() == 'false' ? item.Quantity : item.Quantity + getWeightUnit(item.WeightUnitID) : item.Quantity, qtySpace, false) +
                setAllignedText2(((item.OrderReviewDisplayName && item.OrderReviewDisplayName != ''&& item.OrderReviewDisplayName!='undefined') ? item.OrderReviewDisplayName.trim() : item.Name.trim()), itemSpaceReciept, false) +
                setAllignedText(addDollar(eachPrice, item.IsLoyaltyDiscountItem), eachPriceSpace, true) +
                setAllignedText(addDollar(totalPrice, item.IsLoyaltyDiscountItem), totalPriceSpace, true) + "\n", true)

            // thirdSpace = thirdSpaceTotal - (pricePer.toString().length + 1); // For Dollar sign need to add lengh + 1
        } else {
            oneItem += stringToHex(setAllignedText(item.EnablePricebyWeight ? item.EnablePricebyWeight.toLowerCase() == 'false' ? item.Quantity : item.Quantity + getWeightUnit(item.WeightUnitID) : item.Quantity, qtySpace, false) +
                setAllignedText2(((item.OrderReviewDisplayName && item.OrderReviewDisplayName != ''&& item.OrderReviewDisplayName!='undefined') ? item.OrderReviewDisplayName.trim() : item.Name.trim()), itemSpaceReciept, false) +
                setAllignedText("", eachPriceSpace, true) +
                setAllignedText("", totalPriceSpace, true) + "\n", true);
        }
        oneItem += "1B4500";


        // oneItem += lineSpacing(item.Quantity, item.Name, eachPrice, totalPrice) + "\n"
        var isCombo = item.IsCombo.toString();

        if (
            isCombo.toLowerCase() != "0" &&
            isCombo.toLowerCase() == "true"
        ) {
            //Check if item is combo item
            for (const comboGroup of item.ComboGroup) {
                for (const comboItem of comboGroup.Items) {
                    if (comboItem.isSelected) {
                        //Display Combo item
                        var comboItemName = "";
                        if (comboItem.DisplayName && comboItem.DisplayName != "") {
                            comboItemName = comboItem.DisplayName;
                        } else {
                            comboItemName = comboItem.Name;
                        }
                        comboItemName = "-" + comboItemName.trim() + (comboItem.Quantity ? comboItem.Quantity != '1' ? "(x" + comboItem.Quantity + ")" : "" : "")

                        if (
                            comboItem.ExtraPrice != "" &&
                            comboItem.ExtraPrice != "0" &&
                            comboItem.ExtraPrice != "0.00" && !isRemovePricing
                        ) {
                            oneItem += stringToHex(
                                setAllignedText("", qtySpace, false) +
                                setItemAlignedText(comboItemName, qtySpace, itemSpaceReciept, false) +
                                setAllignedText(addDollar(parseFloat(comboItem.ExtraPrice).toFixed(2)), eachPriceSpace, true) +
                                setAllignedText(addDollar((parseFloat(item.Quantity) * parseFloat(comboItem.Quantity ? comboItem.Quantity : '1') * parseFloat(comboItem.ExtraPrice)).toFixed(2)), totalPriceSpace, true) +
                                "\n", true);

                            // thirdSpace = thirdSpaceTotal - (pricePer.toString().length + 1); // For Dollar sign need to add lengh + 1
                        } else {
                            oneItem += stringToHex(
                                setAllignedText("", qtySpace, false) +
                                setItemAlignedText(
                                    comboItemName,
                                    qtySpace,
                                    itemSpaceReciept,
                                    false
                                ) +
                                setAllignedText("", eachPriceSpace, false) +
                                setAllignedText("", totalPriceSpace, false) +
                                "\n", true);
                        }

                        // oneItem += lineSpacing("", "-" + comboItemName, parseFloat(comboItem.ExtraPrice).toFixed(2), (parseFloat(item.Quantity) * parseFloat(comboItem.Quantity) * parseFloat(comboItem.ExtraPrice)).toFixed(2)) + "\n"
                        //Display Combo item variation
                        if (
                            comboItem.Variations != null &&
                            comboItem.Variations.length > 0
                        ) {
                            for (const variation of comboItem.Variations) {
                                for (const variant of variation.variationOptions) {
                                    if (variant.isSelected) {
                                        var variationName = variation.Name
                                            ? variation.Name + ":" + variant.OptionName
                                            : variant.OptionName;
                                        oneItem += stringToHex(
                                            setAllignedText("", qtySpace, false) +
                                            setItemAlignedText(" " + variationName, qtySpace, itemSpaceReciept, false) +
                                            // setAllignedText2(" " + variationName, itemSpaceReciept, false) +
                                            setAllignedText(isRemovePricing ? "" : addDollar(parseFloat(variant.Price).toFixed(2)), eachPriceSpace, true) +
                                            setAllignedText(isRemovePricing ? "" : addDollar((parseFloat(comboItem.Quantity ? comboItem.Quantity : "1") * parseFloat(item.Quantity) * parseFloat(variant.Price)).toFixed(2)),
                                                totalPriceSpace, true) + "\n", true);
                                    }
                                }
                            }
                        }

                        if (
                            comboItem.Modifiers != null &&
                            comboItem.Modifiers.length > 0
                        ) {
                            oneItem += stringToHex(getFormattedModifier(
                                comboItem.Modifiers,
                                comboItem,
                                item,
                                showNegativeModifiers, showDefaultModifiers
                            ), true);
                        }
                    }
                }
            }

        } else {
            if (item.Variations) {
                for (const variation of item.Variations) {
                    for (
                        let index = 0;
                        index < variation.variationOptions.length;
                        index++
                    ) {
                        const selectedVariation = variation.variationOptions[index];
                        if (selectedVariation.isSelected) {
                            var variatioName = variation.Name;
                            variatioName += ":" + selectedVariation.OptionName;
                            oneItem += stringToHex(
                                setAllignedText("", qtySpace, false) +
                                setItemAlignedText(" " + variatioName, qtySpace, itemSpaceReciept, false) +
                                // setAllignedText2(" " + variatioName, itemSpaceReciept, false) + 
                                setAllignedText(isRemovePricing ? "" : addDollar(selectedVariation.Price), eachPriceSpace, true) +
                                setAllignedText(isRemovePricing ? "" : addDollar((parseFloat(selectedVariation.Price) * parseFloat(item.Quantity)).toFixed(2)),
                                    totalPriceSpace, true) + "\n", true);
                        }
                    }
                }
            }

            oneItem += stringToHex(getFormattedModifier(item.Modifiers, item, null, showNegativeModifiers, showDefaultModifiers), true);
        }

        //Discount row
        if (!isRemovePricing) {
            if (item.IsDiscount) {
                if (item.DiscountAmount && Number(item.DiscountAmount) > 0) {
                    oneItem += stringToHex(
                        setAllignedText("", qtySpace, false) +
                        setItemAlignedText(item.DiscountName, qtySpace, itemSpaceReciept, false) +
                        setAllignedText("", eachPriceSpace, true) +
                        setAllignedText("-" + addDollar(item.DiscountAmount.toFixed(2)), totalPriceSpace, true) +
                        "\n", true);
                }

            }
            else if (item.IsBOGO) {
                oneItem += stringToHex(
                    setAllignedText("", qtySpace, false) +
                    setAllignedText2(
                        item.DiscountName,
                        itemSpaceReciept,
                        false
                    ) +
                    setAllignedText("", eachPriceSpace, true) +
                    setAllignedText("", totalPriceSpace, true) +
                    "\n", true);
            }

            //Item Tax [Start]
            if (
                item.TaxPercentage &&
                item.TaxPercentage != "" &&
                Number(item.TaxPercentage) > 0
                && item.totalPrice && item.totalPrice != "" && parseFloat(item.totalPrice) != 0 && 
                !isTaxHidden
            ) {
                var totalTax =
                    (parseFloat(item.TaxPercentage) *
                    parseFloat(item.totalPrice ? item.totalPrice : 1))/ 100 ;
                oneItem += stringToHex(
                    setAllignedText("", qtySpace, false) +
                    setAllignedText2(
                        (taxType == '2' ? "VAT" : "Item Tax") + " (" + parseFloat(item.TaxPercentage).toFixed(2) + "%)",
                        itemSpaceReciept,
                        false
                    ) +
                    setAllignedText("", eachPriceSpace, true) +
                    setAllignedText(addDollar(totalTax.toFixed(2)), totalPriceSpace, true) +
                    "\n", true);
            }
            //Item Tax [STOP]
        }

        //Special request
        if (item.specialRequest) {
            oneItem += stringToHex(
                setAllignedText("", qtySpace, false) +
                setAllignedText("sp notes:" + item.specialRequest, 36, false) +
                "\n", true);
        }
        //Customer name
        if (item.GuestName != "" && item.GuestName != undefined) {
            oneItem += stringToHex(
                setAllignedText("", qtySpace, false) +
                setAllignedText("Customer Name:" + item.GuestName, 36, false) +
                "\n", true);
        }
        oneItem += stringToHex("\n", true);
        itemsList += oneItem;
    }

    return itemsList;
}

function makeConcessionaireReceipt(message) {
    var subtotalOrder = numberSpaces(Number(message.subtotal))
    var taxOrder = message.tax ? numberSpaces(message.tax) : '0.00'
    var totalOrder = message.total ? numberSpaces(message.total) : '0.00'
    var shippingFee = message.shippingFee && message.shippingFee > 0 ? message.shippingFee : undefined
    var shippingOrder = shippingFee ? numberSpaces(message.shippingFee) : ''
    var tipOrder = numberSpaces(message.tip)
    var discountOrder = numberSpaces(message.discount)
    var promoOrder = numberSpaces("-" + message.promo)

    var address1 = message.address1 !== "" ? String(message.address1).trim() : null;
    var address2 = message.address2 !== "" ? String(message.address2).trim() : null;
    var rewardRedeem = message.rewardRedeem;
    var rewardRedeemDiscountAmout = message.rewardRedeemDiscountAmout;
    var rewardBottomTextEarnPoint = message.rewardBottomTextEarnPoint && message.rewardBottomTextEarnPoint != '' ? center(String(message.rewardBottomTextEarnPoint)) + "\n" : '';
    var rewardBottomTextVisitCount = message.rewardBottomTextVisitCount && message.rewardBottomTextVisitCount != '' ? center(String(message.rewardBottomTextVisitCount)) + "\n" : '';
    var rewardBottomTextRedeemPoints = message.rewardBottomTextRedeemPoints && message.rewardBottomTextRedeemPoints != '' ? center(String(message.rewardBottomTextRedeemPoints)) + "\n" : '';
    var rewardBottomTextTotalPoints = message.rewardBottomTextTotalPoints && message.rewardBottomTextTotalPoints != '' ? center(String(message.rewardBottomTextTotalPoints)) + "\n" +
        "                                          \n" : '';

    var itemsList = "";
    const items = message.items;
    const indent = "  ";
    let conName = "";
    let concessionaireId = "";
    let conTip = "";
    let conDiscount = "";
    let conTax = "";
    let conStoreTotal = "";
    let conSubTotal = "";

    var allConcessionaire = [];

    items.forEach(function (x) {
        allConcessionaire.push({
            ConcessionaireId: x.ConcessionaireId,
            ConcessionaireName: x.ConcessionaireName,
            ConcessionaireColorCode: x.ConcessionaireColorCode
        });
    });

    let uniqueCon = [...new Map(allConcessionaire.map(item => [item["ConcessionaireId"], item])).values()];

    for (let conI = 0; conI < uniqueCon.length; conI++) {
        itemsList += "1D2111" +
            "1B4501" +
            stringToHex(center(removeNewLines(String(uniqueCon[conI].ConcessionaireName)), 2) + "\n\n", true) +
            "1B4501" +
            "1D2100";

        itemsList += getItemMarkup(items, message.taxType);
    }


    //Do Ready data for upcharge
    var isUpChargeCard = message.isUpChargeCard;
    var isPercentageCard = message.isPercentageCard;
    var percentageOrAmounCard = message.percentageOrAmounCard;
    var upChargeAmountCard = message.upChargeAmountCard;
    var nonCashFeeText = "";
    if (isUpChargeCard) {
        if (isPercentageCard) {
            nonCashFeeText = getTotalText("Non Cash Fees(" + percentageOrAmounCard + "%)", addDollar(upChargeAmountCard)) + "\n";
        } else {
            nonCashFeeText = getTotalText("Non Cash Fees", addDollar(upChargeAmountCard)) + "\n"
        }
    }

    var redeemPoints = ""
    if (rewardRedeem) {
        redeemPoints = getTotalText(rewardRedeem, "-" + rewardRedeemDiscountAmout.toString()) + "\n"
    }

    var tokenOrTent = "";
    if (message.doNotPrintOrderToken == 'False') {
        if (message.isTableTent == "True" && message.tableTentNumber != "") {
            tokenOrTent = split("Table Tent:", message.tableTentNumber) + "\n";
        } else {
            tokenOrTent = message.OrderNo
                ? split("Order Token:", "#" + (message.prefix || "") + message.OrderNo) +
                "\n"
                : "";
        }
    }
    var customerPhone = "";
    if (message.customerPhone) {
        customerPhone =
            split("Phone:", message.customerPhone ? message.customerPhone : "") + "\n";
    }

    var tip = "";
    if (conTip && conTip != "" && conTip != "0" && conTip != "0.00") {
        tip = getTotalText("Tip:", addDollarAllowZero(conTip.toString())) + "\n"
    }
    var tax = ""
    // if (taxOrder && taxOrder != "" && taxOrder != "0" && taxOrder != "0.00") {
    tax = getTotalText(message.taxType == '2' ? "VAT:" : "Tax:", addDollarAllowZero(conTax.toString())) + "\n"
    // }
    var ship = ''
    ship = shippingFee ? getTotalText('Shipping Fee:', addDollarAllowZero(shippingOrder.toString())) + '\n' : ''
    var toghetherText = ""

    if (message.doNotPrintOrderToken == 'False' && message.together == 'True') {
        var a = "";

        if (message.isTableTent == "True" && message.tableTentNumber != "") {
            a = "TENT " + message.tableTentNumber;
        } else {
            a = message.OrderNo
                ? "#" +
                (message.prefix || "") +
                String(removeNewLines(message.OrderNo)).trim()
                : "";
        }

        var numspace = (42 - a.length * 4) / 2;

        var emptySpace = "";
        for (var i = 0; i < numspace; i++) {
            emptySpace += " ";
        }

        toghetherText =
            "1D2111" +
            "1B4501" +
            stringToHex(
                (message.orderType
                    ? center(String(removeNewLines(message.orderType)).trim(), 2) + "\n\n"
                    : ""),
                true
            ) +
            "1B4500" +
            "1D2100" +
            "1D2133" +
            stringToHex(center(String(removeNewLines(a)).trim(), 4), true) +
            "1D2100" +
            stringToHex("\n", true);
    }
    // Apply phone number formate
    var phone = ((message.branchContactNo) ? (message.branchContactNo.trim()) : ("")), finalPhone = "";
    if (phone.length >= 6) {
        finalPhone = "(" + phone.substring(0, 3) + ") " + phone.substring(3, 6) + "-" + phone.substring(6);
    } else if (phone.length >= 4) {
        finalPhone = "(" + phone.substring(0, 3) + ") " + phone.substring(3);
    }

    var receiptData =
        stringToHex(
            "                                          \n" +
            center(`--${message.copyType}--`) +
            "\n", true) +
        stringToHex((message.isRefund ? center("Refund") + "\n" : ""), true) +
        "1D2111" +
        "1B4501" +
        stringToHex(center(removeNewLines(String(message.branchName)), 2) + "\n\n", true) +
        "1B4500" +
        "1D2100" +
        stringToHex(center(removeNewLines(String(message.headerText))) +
            "\n" +
            "------------------------------------------\n" +
            "                                  \n" +
            ((address1) ? (setItemAlignedText(address1, 0, 42, false, true) + "\n") : ("")) +
            ((address2) ? (center(removeNewLines(String(address2))) + "\n") : ("")) +
            ((message.branchContactNo) ? (center(removeNewLines(String(finalPhone)).trim()) + "\n") : ("")) +
            ((message.branchTagline) ? (center(removeNewLines(String(message.branchTagline)).trim()) + "\n") : ("")) +
            "                                          \n", true) +
        toghetherText +
        "1B4501" +
        stringToHex(split("Customer Name:", ((message.customerName) ? message.customerName : "Guest")) + "\n" +
            customerPhone
            + tokenOrTent +
            split("Date:", message.date) + "\n" +
            split("Payment Type:", message.PaymentDisplayName) + "\n" +
            split("Order Type:", String(message.orderType).toUpperCase()) + "\n" +
            split("Invoice #:", String(message.invoiceNotodb.substr(message.invoiceNotodb.length - 6)).toUpperCase()) + "\n" +
            (message.thirdPartyOrderId != "" ? split("3rd Party Invoice #:", String(message.thirdPartyOrderId.substr(message.thirdPartyOrderId.length - 6)).toUpperCase()) + "\n" : ""), true) +
        "1B4500" + stringToHex(
            "                                          \n" +
            "                 PURCHASE                 \n" +
            "                                          \n", true);



    receiptData += "1B4501" + stringToHex(
        "QTY   ITEM               EACH        TOTAL\n", true) +
        "1B4500" + stringToHex(
            "------------------------------------------\n", true) +
        itemsList +
        stringToHex(
            "                                          \n" +
            "------------------------------------------\n" +
            getTotalText("Subtotal: ", addDollarAllowZero(conSubTotal.toString())) + "\n" +
            redeemPoints +
            ((message.promotionIsTotal) ?
                (conDiscount.toString() != '' && conDiscount.toString() != '0' && conDiscount.toString() != '0.0') ?
                    (getTotalText("Discount:", "-" + addDollar(conDiscount.toString())) + "\n") : ("") : ("")) +

            tax +
            ship +
            tip +

            nonCashFeeText, true) +
        "1B4501";
    // ((message.promotionIsTotal) ? ("Discount..........................$" + promoOrder.toString() + "\n") : ("")) +
    // stringToHex(getTotalText("Total:", addDollarAllowZero(totalOrder.toString())) + "\n", true) +


    receiptData += "1D2111" +
        stringToHex(getSpaceForBiggerTextH1("Total:", addDollarAllowZero(totalOrder.toString())) + "\n", true) +
        "1D2100" +

        "1B4500" +
        stringToHex(
            "                                          \n" +
            "                                          \n" +
            rewardBottomTextEarnPoint +
            rewardBottomTextVisitCount +
            rewardBottomTextRedeemPoints +
            rewardBottomTextTotalPoints +
            center(String(message.thankYouMessage)) +
            "                                          \n" +
            center(String(message.footerText)) +
            "\n" +
            "                                          \n", true) +
        stringToHex("\n" +
            "                                          \n");



    console.log(receiptData);
    return receiptData;
}

function makeReceipt(message) {
    var subtotalOrder = numberSpaces(Number(message.subtotal))
    var taxOrder = message.tax ? numberSpaces(message.tax) : '0.00'
    var totalOrder = message.total ? numberSpaces(message.total) : '0.00'
    var shippingFee = message.shippingFee && message.shippingFee > 0 ? message.shippingFee : undefined
    var shippingOrder = shippingFee ? numberSpaces(message.shippingFee) : ''
    var tipOrder = numberSpaces(message.tip)
    var discountOrder = numberSpaces(message.discount)
    var promoOrder = numberSpaces("-" + message.promo)
    let serviceFee = message.ServiceFee && message.ServiceFee> 0?message.ServiceFee: undefined
    let serviceFeeOrder=message.ServiceFee ?numberSpaces(message.ServiceFee):'0.00'
    let showSurvey = message.ShowSurveyLinkOnReceipt
    let SurveyLink= message.SurveyLink
    let surveyCode=message.SurveyCode
    var address1 = message.address1 !== "" ? String(message.address1).trim() : null;
    var address2 = message.address2 !== "" ? String(message.address2).trim() : null;
    let reward=message.reward
    let rewardText=Number(message.reward).toFixed(2)
    var rewardRedeem = message.rewardRedeem;
    var rewardRedeemDiscountAmout = message.rewardRedeemDiscountAmout;
    var rewardBottomTextEarnPoint = message.rewardBottomTextEarnPoint && message.rewardBottomTextEarnPoint != '' ? center(String(message.rewardBottomTextEarnPoint)) + "\n" : '';
    var rewardBottomTextVisitCount = message.rewardBottomTextVisitCount && message.rewardBottomTextVisitCount != '' ? center(String(message.rewardBottomTextVisitCount)) + "\n" : '';
    var rewardBottomTextRedeemPoints = message.rewardBottomTextRedeemPoints && message.rewardBottomTextRedeemPoints != '' ? center(String(message.rewardBottomTextRedeemPoints)) + "\n" : '';
    var rewardBottomTextTotalPoints = message.rewardBottomTextTotalPoints && message.rewardBottomTextTotalPoints != '' ? center(String(message.rewardBottomTextTotalPoints)) + "\n" +
        "                                          \n" : '';
    var showNegativeModifiers = message.showNegativeModifiers;
    var showDefaultModifiers = message.showDefaultModifiers;
    var itemsList = "";
    const items = message.items;
    const indent = "  ";
    let conName = "";
    let concessionaireId = "";

    itemsList = getItemMarkup(items, message.taxType, showNegativeModifiers, showDefaultModifiers);


    var receiptItemGroupText = '';
    if (message.ShowReceiptItemGroupsonReceipts == 'True') {
        var receiptItemGroup = message.ReceiptItemGroups;
        for (let i = 0; i < receiptItemGroup.length; i++) {

            receiptItemGroupText += getTotalText(receiptItemGroup[i].name, addDollar(Number(receiptItemGroup[i].total).toFixed(2))) + "\n";
        }
    }
    //Do Ready data for upcharge
    var isUpChargeCard = message.isUpChargeCard;
    var isPercentageCard = message.isPercentageCard;
    var percentageOrAmounCard = message.percentageOrAmounCard;
    var upChargeAmountCard = message.upChargeAmountCard;
    var nonCashFeeText = "";
    if (isUpChargeCard) {
        if (isPercentageCard) {
            nonCashFeeText = getTotalText("Non Cash Fees(" + percentageOrAmounCard + "%)", addDollar(upChargeAmountCard)) + "\n";
        } else {
            nonCashFeeText = getTotalText("Non Cash Fees", addDollar(upChargeAmountCard)) + "\n"
        }
    }

    var redeemPoints = ""
    if (rewardRedeem) {
        redeemPoints = getTotalText(rewardRedeem, "-" + rewardRedeemDiscountAmout.toString()) + "\n"
    }

    var tokenOrTent = "";
    if (message.doNotPrintOrderToken == 'False') {
        if (message.isTableTent == "True" && message.tableTentNumber != "") {
            tokenOrTent = split("Table Tent:", message.tableTentNumber) + "\n";
        } else {
            tokenOrTent = message.OrderNo
                ? split("Order Token:", "#" + (message.prefix || "") + message.OrderNo) +
                "\n"
                : "";
        }
    }

    var customerPhone = "";
    if (message.customerPhone) {
        customerPhone =
            split("Phone:", message.customerPhone ? message.customerPhone : "") + "\n";
    }

    var cardDetailsLine = '';
    if (message.cardType && message.cardType != '') {
        cardDetailsLine = split(message.cardType, message.cardNumber);
    }

    var tip = "";
    if (tipOrder && tipOrder != "" && tipOrder != "0" && tipOrder != "0.00") {
        tip = getTotalText("Tip:", addDollarAllowZero(tipOrder.toString())) + "\n"
    }
    var tax = ""
    // if (taxOrder && taxOrder != "" && taxOrder != "0" && taxOrder != "0.00") {
    tax = getTotalText(message.taxType == '2' ? "VAT:" : "Tax:", addDollarAllowZero(taxOrder.toString())) + "\n"
    // }
    let service = ""
    service = serviceFee ? getTotalText('Service Fee:', addDollar(serviceFeeOrder.toString())) + '\n' : ''
    var ship = ''
    ship = shippingFee ? getTotalText('Shipping Fee:', addDollarAllowZero(shippingOrder.toString())) + '\n' : ''
    var toghetherText = ""

    if (message.doNotPrintOrderToken == 'False' && message.together == 'True') {
        var a = "";

        if (message.isTableTent == "True" && message.tableTentNumber != "") {
            a = "TENT " + message.tableTentNumber;
        } else {
            a = message.OrderNo
                ? "#" +
                (message.prefix || "") +
                String(removeNewLines(message.OrderNo)).trim()
                : "";
        }

        var numspace = (42 - a.length * 4) / 2;

        var emptySpace = "";
        for (var i = 0; i < numspace; i++) {
            emptySpace += " ";
        }

        toghetherText =
            "1D2111" +
            "1B4501" +
            stringToHex(
                (message.orderType
                    ? center(String(removeNewLines(message.orderType)).trim(), 2) + "\n\n"
                    : ""),
                true
            ) +
            "1B4500" +
            "1D2100" +
            "1D2133" +
            stringToHex(center(String(removeNewLines(a)).trim(), 4), true) +
            "1D2100" +
            stringToHex("\n", true);
    }
    // Apply phone number formate
    var phone = ((message.branchContactNo) ? (message.branchContactNo.trim()) : ("")), finalPhone = "";
    if (phone.length >= 6) {
        finalPhone = "(" + phone.substring(0, 3) + ") " + phone.substring(3, 6) + "-" + phone.substring(6);
    } else if (phone.length >= 4) {
        finalPhone = "(" + phone.substring(0, 3) + ") " + phone.substring(3);
    }

    var receiptData =
        stringToHex(
            "                                          \n" +
            center(`--${message.copyType}--`) +
            "\n", true) +
        stringToHex((message.isRefund ? center("Refund") + "\n" : ""), true) +
        "1D2111" +
        "1B4501" +
        stringToHex(center(removeNewLines(String(message.branchName)), 2) + "\n\n", true) +
        "1B4500" +
        "1D2100" +
        stringToHex(center(removeNewLines(String(message.headerText))) +
            "\n" +
            "------------------------------------------\n" +
            "                                  \n" +
            ((address1) ? (setItemAlignedText(address1, 0, 42, false, true) + "\n") : ("")) +
            ((address2) ? (center(removeNewLines(String(address2))) + "\n") : ("")) +
            ((message.branchContactNo) ? (center(removeNewLines(String(finalPhone)).trim()) + "\n") : ("")) +
            ((message.branchTagline) ? (center(removeNewLines(String(message.branchTagline)).trim()) + "\n") : ("")) +
            "                                          \n", true) +
        toghetherText +
        "1B4501" +
        stringToHex(split("Customer Name:", ((message.customerName) ? message.customerName : "Guest")) + "\n" +
            customerPhone
            + tokenOrTent +
            split("Date:", message.date) + "\n" +
            (!isRemovePricing ? split("Payment Type:", message.PaymentDisplayName) + "\n" : "") +
            split("Order Type:", String(message.orderType).toUpperCase()) + "\n" +
            split("Invoice #:", String(message.invoiceNotodb.substr(message.invoiceNotodb.length - 6)).toUpperCase()) + "\n" +
            (message.thirdPartyOrderId != "" ? split("3rd Party Invoice #:", String(message.thirdPartyOrderId.substr(message.thirdPartyOrderId.length - 6)).toUpperCase()) + "\n" : "") +
            cardDetailsLine, true) +
        "1B4500" + stringToHex(
            "                                          \n" +
            "                 PURCHASE                 \n" +
            "                                          \n", true);



    var receiptGroupText = '';
    if (message.ShowReceiptItemGroupsonReceipts == 'True') {
        receiptGroupText = "------------------------------------------\n" + receiptItemGroupText + "\n";
    }

    receiptData += "1B4501" + stringToHex(
        !isRemovePricing ? "QTY   ITEM               EACH        TOTAL\n" : "QTY   ITEM                                \n", true) +
        "1B4500" + stringToHex(
            "------------------------------------------\n", true) +
        itemsList +

        stringToHex(
            "                                          \n" +
            receiptGroupText +
            "------------------------------------------\n" +
            (!isRemovePricing ? getTotalText("Subtotal: ", addDollarAllowZero(subtotalOrder.toString())) + "\n" +
                redeemPoints +
                ((reward!=0)?(getTotalText("Rewards: ",  "-" + addDollar(rewardText.toString()))+"\n"):'')+
                ((message.promotionIsTotal&&message.discount>0) ?
                    (discountOrder.toString() != '' && discountOrder.toString() != '0' && discountOrder.toString() != '0.0') ?
                        (getTotalText("Discount:", "-" + addDollar(discountOrder.toString())) + "\n") : ("") : ("")) +

                service +
                tax +
                ship +
                tip +

                nonCashFeeText : ""), true) +
        "1B4501";
    // ((message.promotionIsTotal) ? ("Discount..........................$" + promoOrder.toString() + "\n") : ("")) +
    // stringToHex(getTotalText("Total:", addDollarAllowZero(totalOrder.toString())) + "\n", true) +


    if(!showSurvey){
        SurveyLink=''
    }else{
        SurveyLink.replace('\n', '')
    }
    receiptData += (!isRemovePricing ? "1D2111" +
        stringToHex(getSpaceForBiggerTextH1("Total:", addDollarAllowZero(totalOrder.toString())) + "\n", true) +
        "1D2100" : "") +

        "1B4500" +
        stringToHex(
            "                                          \n" +
            "                                          \n" +
            (!isRemovePricing ? rewardBottomTextEarnPoint +
                rewardBottomTextVisitCount +
                rewardBottomTextRedeemPoints +
                rewardBottomTextTotalPoints : "") +
            center(String(message.thankYouMessage)) +
            "                                          \n" +                
                SurveyLink +                              
            "                                          \n" +
            center(String(message.footerText)) +
            "\n" +
            "                                          \n", true) +
        stringToHex("\n" +
                "                                          \n");



    console.log(receiptData);
    return receiptData;
}

function giveDotsForRemainingSpace(space, string) {
    var dot = "";
    for (let index = 0; index < space - string.toString().length; index++) {
        dot += ".";
    }
    return dot;
}

function getFormattedModifier(modifier, item, mainItemOfCombo, showNegativeModifiers, showDefaultModifiers) {
    function formatIngredient(ingredient, item) {
        let template = "";
        let ingredientPrice = "";
        var ingredientTotalPrice = "";
        if (Number(ingredient.ExtraPrice) > 0 && !isRemovePricing) {
            ingredientPrice = ingredient.ExtraPrice;
            ingredientTotalPrice = toPrice(
                parseFloat(ingredientPrice) *
                parseFloat(ingredient.Quantity) *
                parseFloat(item.Quantity ? item.Quantity : "1") *
                parseFloat(
                    mainItemOfCombo
                        ? mainItemOfCombo.Quantity
                            ? mainItemOfCombo.Quantity
                            : "1"
                        : "1"
                )
            );
        }
        if ((ingredient.IsDefault == 'True' && showDefaultModifiers == 'True' && !ingredient.isNegativeModifier)
            || (ingredient.IsSelected && ingredient.IsDefault == 'False')) {
            var ingredientName = "";
            if (ingredient.DisplayName && ingredient.DisplayName != "") {
                ingredientName = ingredient.DisplayName;
            } else {
                ingredientName = ingredient.Name;
            }
            if (parseFloat(ingredient.Quantity) > 1) {
                ingredientName +=
                    "(" + parseFloat(ingredient.Quantity).toFixed(0) + ")";
            }

            template +=
                setAllignedText("", qtySpace, false) +
                setItemAlignedText("  -" + ingredientName, qtySpace, itemSpaceReciept, false) +
                setAllignedText(addDollar(ingredientPrice), eachPriceSpace, true) +
                setAllignedText(
                    addDollar(ingredientTotalPrice),
                    totalPriceSpace,
                    true
                ) +
                "\n";
        } else if (ingredient.isNegativeModifier && showNegativeModifiers == 'True') {
            var ingredientName = "";
            if (ingredient.DisplayName && ingredient.DisplayName != "") {
                ingredientName = ingredient.DisplayName;
            } else {
                ingredientName = ingredient.Name;
            }
            var negativeModifiername = "No " + ingredientName;
            template +=
                setAllignedText("", qtySpace, false) +
                setAllignedText2(
                    "  -" + negativeModifiername,
                    itemSpaceReciept,
                    false
                ) +
                setAllignedText("", eachPriceSpace, true) +
                setAllignedText("", totalPriceSpace, true) +
                "\n";
        }
        return template;
    }

    function formatModifier(modifier, item, isNestedlevelModifierSet) {
        let template = "";

        if (modifier.IsSelected) {
            let modifierPrice = "";
            var modifierTotalPrice = "";
            if (Number(modifier.Price) > 0 && !isRemovePricing) {
                modifierPrice = modifier.Price;
                modifierTotalPrice = toPrice(
                    parseFloat(modifierPrice) *
                    parseFloat(modifier.Quantity ? modifier.Quantity : '1') *
                    parseFloat(item.Quantity ? item.Quantity : '1') *
                    parseFloat(
                        mainItemOfCombo
                            ? mainItemOfCombo.Quantity
                                ? mainItemOfCombo.Quantity
                                : "1"
                            : "1"
                    )
                );
            }
            if (isNestedlevelModifierSet) {
                var modifierSetName = "";
                if (modifier.DisplayName && modifier.DisplayName != "") {
                    modifierSetName = modifier.DisplayName;
                } else {
                    modifierSetName = modifier.Category;
                }
                if (parseFloat(modifier.Quantity) > 1) {
                    modifierSetName +=
                        "(" + parseFloat(modifier.Quantity).toFixed(0) + ")";
                }

                template +=
                    setAllignedText("", qtySpace, false) +
                    setAllignedText2(modifierSetName, itemSpaceReciept, false) +
                    setAllignedText(addDollar(modifierPrice), eachPriceSpace, true) +
                    setAllignedText(
                        addDollar(modifierTotalPrice),
                        totalPriceSpace,
                        true
                    ) +
                    "\n";
            }

            // if (modifier.Price && Number(modifier.Price) > 0) {

            //     template += `<span > (+${modifier.Price})</span>`;
            // }

            if (modifier.Ingredients && modifier.Ingredients.length > 0) {
                modifier.Ingredients.sort((a, b) =>
                    Number(a.DisplayOrder) > Number(b.DisplayOrder) ? 1 : -1
                );
                for (let index = 0; index < modifier.Ingredients.length; index++) {
                    const ing = modifier.Ingredients[index];
                    if (ing.IsIngredient && (ing.IsSelected || ing.isNegativeModifier)) {
                        let ingredient = ing;
                        template += formatIngredient(ingredient, item);
                    } else if (ing.IsModifier) {
                        let mod = ing;
                        template += formatModifier(mod, item, true);
                    }
                }
            }
        }

        return template;
    }

    //console.log("html function call");

    let mainTemplate = "";

    if (modifier && modifier.length > 0) {
        modifier.sort((a, b) =>
            Number(a.DisplayOrder) > Number(b.DisplayOrder) ? 1 : -1
        );
        for (let i = 0; i < modifier.length; i++) {
            mainTemplate += formatModifier(modifier[i], item, false);
        }
    }

    return mainTemplate;
}

function getSelectedIngredientCount(modifier) {
    var count = 0;
    var selectedIngredient = modifier.Ingredients.filter((x) => x.IsSelected);
    for (var i = 0; i < selectedIngredient.length; i++) {
        count += Number(selectedIngredient[i].Quantity);
    }

    return count;
}

function getSelectedIngredientCountV2(modifier) {
    var count = 0;
    var selectedIngredient = modifier.Ingredients.filter((x) => x.IsSelected);
    var selectedIngredient = selectedIngredient.filter((x) => x.IsIngredient);
    for (var i = 0; i < selectedIngredient.length; i++) {
        count += Number(selectedIngredient[i].Quantity);
    }

    return count;
}

function tokenTicket(message) {
    var d = new Date();

    var a = "";

    if (message.isTableTent == "True" && message.tableTentNumber != "") {
        a = "TENT " + message.tableTentNumber;
    } else {
        a = message.OrderNo
            ? "#" +
            (message.prefix || "") +
            String(removeNewLines(message.OrderNo)).trim()
            : "";
    }

    var numspace = (42 - a.length * 4) / 2;

    var emptySpace = "";
    for (var i = 0; i < numspace; i++) {
        emptySpace += " ";
    }

    var customerPhone = "";
    if (message.customerPhone) {
        customerPhone =
            split("Phone:", message.customerPhone ? message.customerPhone : "") + "\n";
    }
    var receiptData =
        stringToHex(
            "                                          \n" +
            split(
                "Customer Name:",
                message.customerName ? message.customerName : "Guest"
            ) +
            "\n" +
            customerPhone +
            split("Date:", message.date) +
            "\n" +
            (!isRemovePricing ?
                split("Payment Type:", message.PaymentDisplayName) +
                "\n" : "") +
            split(
                "Invoice #:",
                String(
                    message.invoiceNotodb.substr(message.invoiceNotodb.length - 6)
                ).toUpperCase()
            ) +
            "\n" +
            (message.orderType
                ? center(String(removeNewLines(message.orderType)).trim()) + "\n"
                : "") +
            "------------------------------------------\n" +
            emptySpace,
            true
        ) +
        "1D2133" +
        stringToHex(a, true) +
        "1D2100" +
        stringToHex(
            emptySpace +
            "\n------------------------------------------\n" +
            center(removeNewLines(String(message.branchName))) +
            "\n" +
            "                                          \n" +
            "                                          \n" +
            "                                          \n" +
            "                                          \n"
        );

    console.log(receiptData);

    return receiptData;
}

function stringToHex(tmp, dc) {
    var str = "";
    var tmp_len = tmp.length;
    var c;

    for (var i = 0; i < tmp_len; i += 1) {
        c = tmp.charCodeAt(i).toString(16);
        c == "a" ? (c = "0A") : null;
        str += c.toString(16);

        i == tmp_len - 1 && !dc ? (str += "1B69") : null;
    }
    return str;
}

function numberSpaces(number) {
    var total = Number(number).toFixed(2).toString().split(".");
    if (total[0].length == 1) {
        total[0] = total[0];
    } else if (total[0].length == 2) {
        total[0] = total[0];
    } else if (total[0].length == 3) {
        total[0] = total[0];
    }
    total = total[0] + "." + total[1];
    return total;
}

function center(str, spaces = 1) {
    // if (str.length > (42 / spaces)) {
    var strMain = '';
    var wordSplit = str.split('\n');
    if (wordSplit.length > 1) {
        for (var i = 0; i < wordSplit.length; i++) {

            if ((42 / spaces) - wordSplit[i].length > 0) {
                var emptySpace = "";
                var numspace = ((42 / spaces) - wordSplit[i].length) / 2;
                for (j = 0; j < numspace; j++) {
                    emptySpace += " ";
                }
                strMain += emptySpace + wordSplit[i].trim() + emptySpace + "\n";
            } else {
                strMain += wordSplit[i].trim() + "\n";
            }
        }
        str = strMain
    }



    var result = '';
    while (str.length > 0) {
        if (str.length > (42 / spaces))
            result += str.substring(0, 42);
        else {
            var numspace = ((42 / spaces) - str.length) / 2;

            var emptySpace = "";
            for (var i = 0; i < numspace; i++) {
                emptySpace += " ";
            }
            result += emptySpace + str + emptySpace;
        }
        str = str.substring(42);
    }
    return result;

    //     var numspace = ((42 / spaces) - str.substring(0, (42 / spaces)).length) / 2;

    //     var emptySpace = "";
    //     for (var i = 0; i < numspace; i++) {
    //         emptySpace += " ";
    //     }
    //     var output = emptySpace + str.substring(0, (42 / spaces)) + emptySpace;

    //     var numspace2 = ((42 / spaces) - str.substring((42 / spaces), (84 / spaces)).length) / 2;

    //     var emptySpace = "";
    //     for (var i = 0; i < numspace2; i++) {
    //         emptySpace += " ";
    //     }
    //     output += "\n" + emptySpace + str.substring((42 / spaces), (84 / spaces)) + emptySpace;

    //     return output;
    // } else {
    //     var numspace = ((42 / spaces) - str.length) / 2;

    //     var emptySpace = "";
    //     for (var i = 0; i < numspace; i++) {
    //         emptySpace += " ";
    //     }
    //     var output = emptySpace + str + emptySpace;
    //     return output;
    // }
}

function left(str) {
    var numspace = 42 - str.length;

    var emptySpace = "";
    for (var i = 0; i < numspace; i++) {
        emptySpace += " ";
    }

    var output = emptySpace + str;

    return output;
}

function split(str, str2) {
    var numspace = 42 - str.length - str2.length;

    var emptySpace = "";
    for (var i = 0; i < numspace; i++) {
        emptySpace += " ";
    }

    var output = str + emptySpace + str2;

    return output;
}

function splitDot(str, str2) {
    var numspace = 42 - str.length - str2.length;

    var emptySpace = "";
    for (var i = 0; i < numspace; i++) {
        emptySpace += ".";
    }

    var output = str + emptySpace + str2;

    return output;
}

function writeLine(txt) {
    this.printer.addText(txt + "\n");
}

function write(txt) {
    this.printer.addText(txt);
}

function lineSpacing(quantity, item, pricePer, priceTotal) {
    var firstSpaceTotal = 7;
    var firstSpace = firstSpaceTotal - quantity.toString().length;

    var secondSpaceTotal = 20;
    var secondSpace = 0;
    var itemName = "";
    itemName = setItemAlignedText(item.toString(), 7, 20, false);
    // if (item != undefined) {

    //     if (item.length > 20) {
    //         itemName = item.toString().trim().substring(0, 20) + '\n       ' + item.toString().trim().substring(20, 40);
    //         secondSpace = secondSpaceTotal - item.toString().trim().substring(20, 40).length;
    //     } else {
    //         itemName = item.toString().trim();
    //         secondSpace = secondSpaceTotal - item.toString().trim().length;
    //     }
    // }

    var thirdSpaceTotal = 8;
    var thirdSpace = 0;
    if (pricePer != "" && pricePer != "0" && pricePer != "0.00") {
        thirdSpace = thirdSpaceTotal - (pricePer.toString().length + 1); // For Dollar sign need to add lengh + 1
    } else {
        thirdSpace = thirdSpaceTotal - pricePer.toString().length;
    }

    var fourthSpaceTotal = 7;
    var fourthSpace = 0;
    if (priceTotal != "" && priceTotal != "0" && priceTotal != "0.00") {
        fourthSpace = fourthSpaceTotal - (priceTotal.toString().length + 1); // For Dollar sign need to add lengh + 1
    } else {
        fourthSpace = fourthSpaceTotal - priceTotal.toString().length;
    }

    var emptySpace1 = "";
    for (var i = 0; i < firstSpace; i++) {
        emptySpace1 += " ";
    }

    var firstWord = quantity + emptySpace1;

    var emptySpace2 = "";
    for (var i = 0; i < secondSpace; i++) {
        emptySpace2 += " ";
    }

    var secondWord = itemName + emptySpace2;
    // var secondWord = item;

    var emptySpace3 = "";
    for (var i = 0; i < thirdSpace; i++) {
        emptySpace3 += " ";
    }

    var thirdWord = "";
    if (pricePer != "" && pricePer != "0" && pricePer != "0.00") {
        thirdWord += currencySymbol + toPrice(pricePer) + emptySpace3;
    } else {
        thirdWord += emptySpace3;
    }

    var emptySpace4 = "";
    for (var i = 0; i < fourthSpace; i++) {
        emptySpace4 += " ";
    }

    var fourthWord = "";
    if (priceTotal != "" && priceTotal != "0" && priceTotal != "0.00") {
        fourthWord += currencySymbol + toPrice(priceTotal);
    } else {
        fourthWord += emptySpace4;
    }

    var word = firstWord + secondWord + thirdWord + fourthWord;

    return word;
}

function zReportLineSpacing(row, price) {
    var firstSpaceTotal = 34;
    price = currencySymbol + (toPrice(price) || "0.00");
    var firstSpace = firstSpaceTotal - row.toString().length;

    var secondSpaceTotal = 7;
    var secondSpace = 0;
    var itemName = "";
    if (price != undefined) {
        itemName = setItemAlignedText(price, 34, 7, false);
    }

    var emptySpace1 = "";
    for (var i = 0; i < firstSpace; i++) {
        emptySpace1 += " ";
    }

    var firstWord = row + emptySpace1;

    var emptySpace2 = "";
    for (var i = 0; i < secondSpace; i++) {
        emptySpace2 += " ";
    }

    var secondWord = itemName + emptySpace2;

    var word = firstWord + secondWord;

    return word;
}

function addDollar(price, showZero=false) {
    if(showZero){
        return currencySymbol + parseFloat(price).toFixed(2);
    }
    if (price != "" && price != "0" && price != "0.00") {
        return currencySymbol + parseFloat(price).toFixed(2);
    }
    return "";
}

function addDollarAllowZero(price) {
    return currencySymbol + price;
}

function lineSpacingV2(quantity, item) {
    var firstSpaceTotal = 7;
    var firstSpace = firstSpaceTotal - quantity.toString().length;

    var secondSpaceTotal = 34;
    var secondSpace = 0;
    var itemName = "";
    if (item != undefined) {
        itemName = setItemAlignedText(item.toString(), 7, 34, false);

        // if (item.length > 34) {
        //     itemName = item.toString().trim().substring(0, 34) + '\n       ' + item.toString().trim().substring(34, 68);
        //     secondSpace = secondSpaceTotal - item.toString().trim().substring(34, 68).length;
        // } else {
        //     itemName = item.toString().trim();
        //     secondSpace = secondSpaceTotal - item.toString().trim().length;
        // }
    }

    var emptySpace1 = "";
    for (var i = 0; i < firstSpace; i++) {
        emptySpace1 += " ";
    }

    var firstWord = quantity + emptySpace1;

    var emptySpace2 = "";
    for (var i = 0; i < secondSpace; i++) {
        emptySpace2 += " ";
    }

    var secondWord = itemName + emptySpace2;

    var word = firstWord + secondWord;

    return word;
}

function setItemAlignedText(str_text, padding, space, isDigit, isCenter = false) {
    var txt = "";
    var txt_space = "";
    str_text = str_text.toString().trim();
    var space_cnt = 0;
    if (str_text.toString().trim().length > space) {
        var wordsInItemName = str_text.split(" ");
        if (wordsInItemName.length == 0 || wordsInItemName.length == 1) {
            //str_text = str_text.substring(0, space - 3).trim() + "...";
            for (var i = 0; i < str_text.length; i++) {
                if (i > 1 && i % space == 0) {
                    txt = txt + "\n";
                    for (n = 0; n < padding; n++) {
                        txt = txt + " ";
                    }
                    space_cnt = 0;
                    txt = txt + str_text.charAt(i);
                    space_cnt++;
                } else {
                    txt = txt + str_text.charAt(i);
                    space_cnt++;
                }
            }
            for (let index = 0; index < space - space_cnt; index++) {
                txt_space = txt_space + " ";
            }
            return txt + txt_space;
        } else {
            var availableSpace = space;
            for (var i = 0; i < wordsInItemName.length; i++) {
                if (wordsInItemName[i].length < availableSpace) {
                    txt += wordsInItemName[i] + " ";
                    availableSpace = availableSpace - (wordsInItemName[i].length + 1);
                } else if (wordsInItemName[i].length == availableSpace) {
                    txt += wordsInItemName[i];
                    availableSpace = 0;
                } else {
                    txt = txt + "\n";
                    for (n = 0; n < padding; n++) {
                        txt += " ";
                    }

                    availableSpace = space;
                    var str = wordsInItemName[i];
                    if (str.length >= space || str.length >= space) {
                        var startIndex = 0;
                        var endIndex = space;
                        for (j = 0; j < str.length; j++) {
                            if (j > 0) {
                                startIndex = endIndex;
                                endIndex = Math.min(endIndex + space, str.length);
                            }
                            var stringToPrint = str.substring(
                                startIndex,
                                Math.min(endIndex, str.length)
                            );
                            txt = txt + stringToPrint + " ";
                            if (endIndex == str.length) {
                                if (stringToPrint.length < availableSpace) {
                                    availableSpace = availableSpace - (stringToPrint.length + 1);
                                } else {
                                    availableSpace = 0;
                                }
                                // availableSpace = space;
                                // availableSpace = availableSpace - (stringToPrint.length());
                                break;
                            } else {
                                txt = txt + "\n";
                                for (n = 0; n < padding; n++) {
                                    txt += " ";
                                }
                                // line_flag++;
                            }
                        }
                    }
                    else {
                        if (isCenter) {
                            var length = 0;
                            var tempSpace = ""
                            for (let index = i; index < wordsInItemName.length; index++) {
                                length += wordsInItemName[index].length + 1;
                            }
                            if (length < availableSpace) {
                                for (n = 0; n < (availableSpace - length) / 2; n++) {
                                    tempSpace += " ";
                                }
                                txt += tempSpace;
                                availableSpace = availableSpace - tempSpace.length;
                            }
                        }

                        txt += wordsInItemName[i] + " ";
                        // availableSpace = space;
                        availableSpace = availableSpace - (wordsInItemName[i].length + 1);
                    }
                }
            }

            for (n = 0; n < availableSpace; n++) {
                txt += " ";
            }
            return txt + txt_space;
        }
    } else {
        if (isCenter) {
            return center(str_text)
        }
        var str_space = "";
        for (var i = 0; i < space - str_text.length; i++) str_space = str_space + " ";

        if (isDigit) str_text = str_space + str_text;
        else str_text = str_text + str_space;

        return str_text;
    }
}

function setAllignedText(str_text, space, isDigit) {
    
    console.log(str_text)

    var txt = "";
    var line_flag = 0;
    var space_cnt = 0;
    var charCount = 0;
    var txt_space = "";
    if (str_text.length > space) {
        //str_text = str_text.substring(0, space - 3).trim() + "...";
        for (var i = 0; i < str_text.length; i++) {
            if (line_flag == 0) {
                if (i > 1 && charCount == 35) {
                    txt = txt + "\n               ";
                    line_flag++;
                    space_cnt = 0;
                    txt = txt + str_text.charAt(i);
                    charCount = 1;
                } else {
                    txt = txt + str_text.charAt(i);
                    space_cnt++;
                    charCount++;
                }
            } else {
                if (i > 1 && charCount == 26) {
                    txt = txt + "\n               ";
                    line_flag++;
                    space_cnt = 0;
                    txt = txt + str_text.charAt(i);
                    charCount = 1;
                } else {
                    if (str_text.charAt(i).toString() == "\n") {
                        txt = txt + str_text.charAt(i) + "               ";
                        line_flag++;
                        charCount = 1;
                    } else {
                        txt = txt + str_text.charAt(i);
                    }
                    space_cnt++;
                    charCount++;
                }
            }
        }

        for (j = 0; j < 28 - (space_cnt + 1); j++) {
            txt_space = txt_space + " ";
        }
        return txt + txt_space;
    } else {
        var str_space = "";
        for (var i = 0; i < space - str_text.length; i++) str_space = str_space + " ";

        if (isDigit) str_text = str_space + str_text;
        else str_text = str_text + str_space;

        return str_text;
    }
}

function addNewlines(str) {
    var result = '';
    while (str.length > 0) {
        if (str.length > 15)
            result += str.substring(0, 15) + '\n      ';
        else {
            result += str + " ".repeat(15 - str.length);
        }
        str = str.substring(15);
    }
    return result;
}

function setAllignedText2(str_text, space, isDigit) {
    // console.log(str_text, str_text.length);
    return addNewlines(str_text, 15);
}

function getWeightUnit(weightUnit) {
    if (weightUnit == '0') {
        return 'oz';
    } else if (weightUnit == '1') {
        return 'lb';
    } else if (weightUnit == '2') {
        return 'g';
    } else if (weightUnit == '3') {
        return 'kg';
    } else {
        return '';
    }
}

function getTotalText(text, amount) {
    var totalText = text;
    var space = 42 - (text.length + amount.length);

    for (var i = 0; i < space; i++) {
        totalText += " ";
    }
    totalText += amount;
    return totalText;
}

function getSpaceForBiggerTextH1(text, amount) {
    var totalText = text;
    var space = 21 - (text.length + amount.length);

    for (var i = 0; i < space; i++) {
        totalText += " ";
    }
    totalText += amount;
    return totalText;
}

function removeNewLines(str) {
    return str.replace(/(\r\n|\n|\r)/gm, " ");
}
/* receipt printing code ends */
