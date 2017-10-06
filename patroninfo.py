# For library dashboard 
import json 
import secrets 
import requests


# Function to get sierra api/token via secrets file reference
def get_token():
    url = "https://catalog.chapelhillpubliclibrary.org/iii/sierra-api/v4/token"
    # Create header with  API key from secrets.py
    header = {"Authorization": "Basic " + str(secrets.sierra_api), "Content-Type": "application/x-www-form-urlencoded"}
    # Get response info
    response = requests.post(url, headers=header)
    json_response = json.loads(response.text)
    # Create var to hold the response data and return
    active_patrons_token = json_response["access_token"]
    # Test
    print("get_token() called")
    return active_patrons_token

# Function that creates json file of patron IDs
def get_activepatrons():
    
    # Open file to write to and write inital json line
    patron_ids = open("patronids.json","w")
    patron_ids.write('{ "entries": [ \n')

    # Create header and call get_token()
    header_text = {"Authorization": "Bearer " + get_token()}
    # Prime loop
    i = 0
    loop = True
    while loop == True:
        # Test
        print(i)
        # Patron ID request URL
        request = requests.get("https://catalog.chapelhillpubliclibrary.org:443/iii/sierra-api/v4/patrons/?limit=2000&offset=" + str(i) + "&deleted=false", headers=header_text)
        # Stop looping when the requests sends an error code/doesn't connect
        if request.status_code != 200:
            break
        elif i != 0:
            # Add a comma and newline for better organization and format
            patron_ids.write(',\n')
        # Counter to find slice start point 
        counter = 1
        for letter in request.text:
            if letter == '[':
                break
            counter += 1
        # Slice off the beginning and ends of json to allow for combining all data
        sliced_json = request.text[counter:-2]
        # Write data to patron json file 
        patron_ids.write(sliced_json)
        print("written")
        # Increment i 
        i = i + 2000
        
    # Write final line and close file
    patron_ids.write(']}')
    patron_ids.close()
    
    read_patrons = open("patronids.json","r")

    patronfile = json.load(read_patrons)
    
    # Create new json file to store just the IDs
    id_file = open("patron_id_list.csv", "w")
    
    # Get list of patron IDs and write to CSV
    for entry in patronfile["entries"]:
        i = entry["id"]
        id_file.write(str(entry["id"])+",")
    
# Function to get checkout info for each patron
def get_checkout_info():
    # Open the patron_ids.json file created by get_activepatrons() and load json
    patron_ids = open("patronids.json", "r")
    patronfile = json.load(patron_ids)
    
    # Create new json file to store just the IDs
    id_file = open("patron_id_list.json", "w")
    
    # Create header text via get_token() 
    header_text = {"Authorization": "Bearer " + get_token()}
    
    # Prime loop 
    loop = True
    while loop == True:
        
        # Get list of patron IDs
        for entry in patronfile["entries"]:
            i = entry["id"]
            print(i)
            # URL to find checkout info 
            checkout_url = "https://catalog.chapelhillpubliclibrary.org:443/iii/sierra-api/v4/patrons/" + str(i) + "/checkouts?fields=dueDate%2CnumberOfRenewals"
            request = requests.get(checkout_url, headers=header_text)
            # Stop looping when the requests sends an error code/doesn't connect
            if request.status_code != 200:
                break
            elif i != 0:
                # adds a comma and newline for better organization and format
                id_file.write(',\n')
            # Counter to find slice start point 
            counter = 1
            for letter in request.text:
                if letter == '[':
                    break
                counter += 1
                
            # Slice off the beginning and ends of json to allow for combining all data
            sliced_json = request.text[counter:-2]
            print(sliced_json)
            
            
            # Write data to patron json file 
            id_file.write(sliced_json)
            idlistfile = open("patron_id_list.json", "r")
            for line in idlistfile.readlines():
                print(line)
        
    print("get_checkout_info called")
    

def main():
    get_activepatrons()
    
    # Create final file to combine all info into 
    final_file = open("patroninformation.json", "w")
    # Call functions to get info
    final_file.write(get_checkout_info())

    print("main called")
    
main()
