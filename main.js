/*global $*/
// initialize variables for interval of refreshing
var minutes = 15;
var milliseconds = min_to_ms(minutes);
var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
var d = new Date();
var currMonth = d.getMonth();
var currYear = d.getFullYear();
$('.currMonth').text(monthNames[currMonth]);
$('.currYear').text(currYear);

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
            if(record.fields.date.includes("Reservations")) {
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
            $('#library-total').text(amount_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
            $('#library-percent-expired').text((amount_exp/amount_total * 100).toFixed(2));
        });
    });    
}

// update number of datasets
function update_catalog_data() {
    var temp;
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=daily-catalog-searches&sort=column_2&apikey=" + ODS_api + "&callback=?", function(dailyCat){
        // save top searches today in variable
        temp = dailyCat.records[0].fields.column_1;
        $('#topCatToday').text(temp);
    });      
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=monthly-library-catalog-searches&sort=column_2&apikey=" + ODS_api + "&callback=?", function(monthlyCat){
        // save top searches this month in variable
        temp = monthlyCat.records[0].fields.column_1;
        $('#topCatMonth').text(temp);
    });   
}

// update website data info
function update_site_data() {
    var variable;
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=daily-sessions-chpl-website&apikey=" + ODS_api + "&callback=?", function(daily_sessions){
        // save amount of sessions today in variable
        variable = daily_sessions.records[0].fields.column_2;
        $('#sToday').text(variable);
    });
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=monthly-sessions-chpl-website&apikey=" + ODS_api + "&callback=?", function(monthly_sessions){
        // save amount of sessions this month in variable
        variable = monthly_sessions.records[0].fields.column_2;
        $('#sMonth').text(variable);
    });
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=dailysearch&sort=column_2&apikey=" + ODS_api + "&callback=?", function(daily_search){
        // save top searches today in variable
        variable = daily_search.records[0].fields.column_1;
        $('#topToday').text(variable);
    });
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=monthlysearch&sort=column_2&apikey=" + ODS_api + "&callback=?", function(monthly_search){
        // save top searches this month in variable
        variable = monthly_search.records[0].fields.column_1;
        $('#topMonth').text(variable);
    });
}

// update patron info
function update_patrons() {
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=patron-data&apikey=" + ODS_api + "&callback=?", function(patron_data){
        // save average age of unexpired patrons in variable
        var age = patron_data.records[0].fields.average_age;
        var blocked = patron_data.records[0].fields.blocked_patrons;
        $('#avg-age').text(Math.round(age));
        $('#blocked').text(blocked);
    });
}

// update items info
function update_items() {
    var total_checked_out = 0;
    $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=overdue-items&rows=1&apikey=" + ODS_api + "&callback=?", function(od_items) {
        // add amount of overdue items to checked out items
        $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=checked-out-items&rows=1&apikey=" + ODS_api + "&callback=?", function(co_items) {
            total_checked_out = co_items.nhits+od_items.nhits;
            $('#checked').text(total_checked_out);
            $.getJSON("https://www.chapelhillopendata.org/api/records/1.0/search/?dataset=library-items&rows=1&facet=status&refine.status=AVAILABLE&apikey=" + ODS_api + "&callback=?", function(total_a) {
                $('#totalAvailable').text(total_a.nhits - total_checked_out);
                $('#items-percent-out').text((total_checked_out/total_a.nhits*100).toFixed(2));
            });
        });
        
        $('#overdue').text(od_items.nhits);
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
    
    // update catalog info
    update_catalog_data();
    
    // update website info
    update_site_data();
 
    // update patron info
    update_patrons();
    
    // update items info
    update_items();
    
    // display updated date
    var d = new Date();
    var offset = -300;
    var estDate = new Date(d.getTime() + offset*60*1000);
    var uDate = estDate.toUTCString().replace('GMT', '');
    $('#stamp').text('Updated: ' + uDate);
}

// function that calls update_page every specified minutes
function update_interval(interval) {
    var update = setInterval(update_page, interval);
}

// call update_page to get the initial values
update_page();

// call update_interval to display the data and start timer
update_interval(milliseconds);
