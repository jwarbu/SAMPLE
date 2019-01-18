import json
import boto3
from boto3.dynamodb.conditions import Key
import os

# DynamoDB table with key: tags ; attribute: filepath
search = os.environ['SEARCH'] 

# DynamoDB table with key: filepath ; attribute(s): project details
details = os.environ['DETAILS'] 

ddb = boto3.resource('dynamodb')
search_table = ddb.Table(search)
details_table = ddb.Table(details)

def lambda_handler(event, context):

	# store projects that are tagged with at least one term
    projects_found = set()

    # example terms: ['java', 'android']
    for i in range(len(event['search_term'])): 
    
        # DynamoDB query outputs:{'Items':[{'project_path':StringSet,...]}
        term_list = search_table.query(
            KeyConditionExpression=Key('search_term').eq(event['search_term'][i].lower())
            )['Items']
        
        # if term_list = 0 then no projects tagged with given search_term
        if len(term_list) > 0: 

        	# stored in set so if project previously added, will not be duplicated
            projects_found = projects_found.union(term_list[0]['project_path'])
    

    projects = list(projects_found) # convert to list for JSON
    project_details = retrieve_project_info(projects)
    
    if len(project_details) > 0:
        return project_details #json.dumps(message)
        
    else:
        return None


def retrieve_project_info(projects): #list

    # grab proj details from DynamoDB   
    project_details = []
    for filepath in projects:

        # send to DDB
        items = details_table.query(
            KeyConditionExpression=Key('project_path').eq(filepath))['Items']

        if len(items) > 0:
            project_details.append(items[0])

    return project_details
        
