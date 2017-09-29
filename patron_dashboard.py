# import required library for accessing Sierra with authorization
import requests
import json
import csv
import datetime
import secrets

# set present date equal to 'now' variable
now = datetime.datetime.now()

# function that gets the authentication token
def get_token():
    url = "https://catalog.chapelhillpubliclibrary.org/iii/sierra-api/v3/token"
    header = {"Authorization": "Basic " + str(secrets.sierra_api), "Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(url, headers=header)
    json_response = json.loads(response.text)
    token = json_response["access_token"]
    return token

# function that creates a csv file and adds on expired patron's names, addresses, emails, and exp. date
def create_csv(writer):
    # first id is 100010
    id = 100010

    # loop until there are no more patron records (error code 200)
    while True:
        
        url = "https://catalog.chapelhillpubliclibrary.org/iii/sierra-api/v3/patrons?limit=2000&deleted=false&fields=expirationDate,addresses,names,emails&id=["+str(id)+",]"
        request = requests.get(url, headers={
                    "Authorization": "Bearer " + get_token()
                })
                
        if request.status_code != 200:
            break
                
        jfile= json.loads(request.text)
        
        for entry in jfile["entries"]:
            try:
                row = []
                expy = int(entry["expirationDate"].split('-')[0])
                expm = int(entry["expirationDate"].split('-')[1])
                expd = int(entry["expirationDate"].split('-')[2])
                converted_date = datetime.datetime(expy,expm,expd)
                if int(converted_date <= now):
                    # print(entry)
                    row.append(entry["names"][0])
                    row.append(entry["addresses"][0]['lines'])
                    row.append(entry["emails"][0])
                    row.append(entry["expirationDate"])
                    writer.writerow(row)
            except KeyError:
                continue
        
        id = jfile["entries"][-1]["id"] + 1
        
        print(id)
        
# open csv file for writing
expired_patrons = open('//CHFS/Shared Documents/OpenData/datasets/unpublished/expired_patrons.csv', 'w')

# create a csvwriter object
csvwriter = csv.writer(expired_patrons)

# write a header & call the create_csv function
csvwriter.writerow(['names','addresses','emails','expirationDate'])
create_csv(csvwriter)

# close file
expired_patrons.close()