var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei('1')
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'


    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])
    

    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)

        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
    })    

    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        await supplyChain.processItem(upc, {from: originFarmerID});
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State');
    })    

    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        await supplyChain.packItem(upc, {from: originFarmerID});
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        assert.equal(resultBufferTwo[5], 2, "Error: Invalid item State");
    })    

    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        await supplyChain.sellItem(upc, productPrice, {from: originFarmerID});
        
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item Price');
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State');
    })    

    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        await supplyChain.addDistributor(distributorID);
        await supplyChain.buyItem(upc, {from: distributorID, value: productPrice});
        
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
        assert.equal(resultBufferOne[2], distributorID, 'Error: Invalid item Owner');
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid item Owner');
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item Price');
    })    

    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        await supplyChain.shipItem(upc, {from: distributorID});
        
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
        assert.equal(resultBufferOne[2], distributorID, 'Error: Invalid item Owner');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid item Owner');
        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State');
    })    

    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()

        await supplyChain.addRetailer(retailerID);
        await supplyChain.receiveItem(upc, {from: retailerID});
        
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
        assert.equal(resultBufferOne[2], retailerID, 'Error: Invalid item Owner');
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Invalid item Owner');
    })    

    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        await supplyChain.addConsumer(consumerID);
        await supplyChain.purchaseItem(upc, {from: consumerID});
        
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
        assert.equal(resultBufferOne[2], consumerID, 'Error: Invalid item Owner');
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid item Owner');
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State');
    })    

    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');
        assert.equal(resultBufferOne[2], consumerID, 'Error: Invalid item ownerID');
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Invalid item originFarmerID');
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Invalid item originFarmName');
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Invalid item originFarmInformation');
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Invalid item originFarmLatitude');
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Invalid item originFarmLongitude');
    })

    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU');
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC');
        assert.equal(resultBufferTwo[2], productID, 'Error: Invalid item productID');
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Invalid item productNotes');
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item productPrice');
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item itemState');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid item distributorID');
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Invalid item retailerID');
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid item consumerID');
    })
});