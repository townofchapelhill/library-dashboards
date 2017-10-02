/*global $*/
// initialize variables for interval of refreshing
var minutes = 120;
var milliseconds = min_to_ms(minutes);

// function that converts minutes to milliseconds for use in update_interval function
function min_to_ms(min) {
    return min*60*1000;
}

// update meeting data
function update_meetings() {
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=meeting-room-usage&rows=1000&sort=time&apikey=" + ODS_api + "&callback=?", function(meeting){
        // initialize a variable to display the title (today's date) at the top and list of usage data
        var usage_values = [];
        
        // loops through file and adds a row of data to the table after each iteration
        for (var i = 0; i < meeting.records.length; i++) {
            var record = meeting.records[i];
            // skip table data
            if(record.fields.status == "Approved" || record.fields.status == "Pending"){
                continue;
            // monthly popularity data
            }else if(record.fields.enddate == '%'){
                continue;
            // usage data
            }else{
                usage_values.push(Number(record.fields.time));
            }
        }
        
        // loops through meeting room id's and adds usage values
        for (var i = 0; i < usage_values.length; i++) {
            $('#m' + i).text(usage_values[i]);
        }
        
    });
}

// update library card data
function update_cards() {
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=patron-dashboard&rows=1&apikey=" + ODS_api + "&callback=?", function(exp_patron){
        // save expired amount of cards in variable
        var amount_exp = exp_patron.nhits;
        $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=patrons&rows=1&apikey=" + ODS_api + "&callback=?", function(all_patrons){
            // save total amount of cards in variable
            var amount_total = all_patrons.nhits;
            // add expired amount and calculate percentage
            $('#library-total').text(amount_exp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
            $('#library-percent-expired').text((amount_exp/amount_total * 100).toFixed(2));
        });
    });    
}

// update number of datasets
function update_num_datasets() {
    $.getJSON("https://www.chapelhillopendata.org/api/datasets/1.0/search?rows=0&apikey=" + ODS_api + "&callback=?", function(datasets){
        // save amount of datasets in variable
        var amount_datasets = datasets.nhits;
        $('#num-datasets').text(amount_datasets);
    });      
}

// update circulator item info
function update_circulator() {
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=circulator&rows=0&apikey=" + ODS_api + "&callback=?", function(circ_items){
        // save amount of items in circulator in variable
        var circ_values = circ_items.nhits;
        $('#circ-location').text(circulator_location);
        $('#circulator').text(circ_values);
    });
}

// function that gets a json and updates the page 
function update_page() {
    // gets local json file
    /*global $*/
    /*global ODS_api*/
    /*global circulator_location*/
    
    // update meeting room info
    update_meetings();
    
    // update library card info
    update_cards();
    
    // update number of datasets
    update_num_datasets();
    
    // update circulator
    update_circulator();
    
}

// function that calls update_page every specified minutes
function update_interval(interval) {
    var update = setInterval(update_page, interval);
}

// call update_page to get the initial values
update_page();

// call update_interval to display the data and start timer
update_interval(milliseconds);