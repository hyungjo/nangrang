import pandas as pd
import numpy as np
from numpy import genfromtxt
from flask import Flask, redirect, url_for, request,jsonify
from difflib import *
import pymongo
import re

app = Flask(__name__)

load = False
is_corr = False
test = [1544, 2160 ,1688 ,551, 1]
id_to_index = {}
index_to_id = {}
movie_to_index = {}
index_to_movie = {}

def set_matrix(my_data):
    unique_Id, counts = np.unique(my_data[:, 1], return_counts=True)
    unique_movieId, counts = np.unique(my_data[:, 2], return_counts=True)

    x, y = len(unique_Id), len(unique_movieId)
    matrix = np.zeros((x, y), dtype=int)


    for id, idx in enumerate(unique_Id):
        id_to_index[idx] = id
        index_to_id[id] = idx

    for id, idx in enumerate(unique_movieId):
        movie_to_index[idx] = id
        index_to_movie[id] = idx

    for raw in my_data:
        if id_to_index[raw[1]] > x:
            continue
        matrix[id_to_index[raw[1]]][movie_to_index[raw[2]]] = raw[3]
    return matrix


def pearson_correlation(dict_data, item1, item2):
    # To get both rated items
    both_rated = {}
    for user in dict_data[item1]:
        if user in dict_data[item2]:
            both_rated[user] = 1

    number_of_ratings = len(both_rated)

    # Checking for number of ratings in common
    if number_of_ratings == 0:
        return 0

    # Add up all the preferences of each user
    item1_preferences_sum = sum([dict_data[item1][user] for user in both_rated])
    item2_preferences_sum = sum([dict_data[item2][user] for user in both_rated])

    # Sum up the squares of preferences of each user
    item1_square_preferences_sum = sum([pow(dict_data[item1][user], 2) for user in both_rated])
    item2_square_preferences_sum = sum([pow(dict_data[item2][user], 2) for user in both_rated])

    # Sum up the product value of both preferences for each user
    product_sum_of_both_items = sum([dict_data[item1][user] * dict_data[item2][user] for user in both_rated])

    # Calculate the pearson score
    numerator_value = product_sum_of_both_items - (item1_preferences_sum * item2_preferences_sum / number_of_ratings)
    denominator_value = np.sqrt((item1_square_preferences_sum - pow(item1_preferences_sum, 2) / number_of_ratings) \
                                * (item2_square_preferences_sum - pow(item2_preferences_sum, 2) / number_of_ratings))

    if denominator_value == 0:
        return 0
    else:
        r = numerator_value / denominator_value
        return r

def pearson_corr(matrix):
    df = pd.DataFrame(matrix).T
    item_corr = df.corr(method='pearson')
    item_corr = np.array(item_corr.values)
    return item_corr

def read_data(filename):
    # data matrix npy
    if load:
        matrix = np.load("matrix.npy")

    else:
        my_data = genfromtxt(filename, delimiter=',', skip_header=True, dtype=int)
        matrix = set_matrix(my_data)

        np.save("matrix.npy",matrix)

    # correlation matrix npy
    if is_corr:
        item_corr = pearson_corr(matrix)
        np.save("corr.npy", item_corr)
    else:
        item_corr = np.load("corr.npy")
    return matrix, item_corr




def recommend(user_id):
    matrix,item_corr = read_data("train_v2.csv")
    seen_list,seen_dict,unseen_list,unseen_dict = get_user_itemlist(matrix,id_to_index[user_id])
    for unseen_ in unseen_list:
        numer = 0
        denom = 0

        for seen_ in np.array(seen_list)[:,0]:
            if item_corr[unseen_, seen_] > 0:
                numer += item_corr[unseen_, seen_] * seen_dict[seen_]
                denom += item_corr[unseen_, seen_]

        if denom == 0:
            unseen_dict[unseen_] = np.mean(matrix.T[unseen_])
        else:
            unseen_dict[unseen_] = numer / denom

    return sorted(unseen_dict.items(), key = operator.itemgetter(1),reverse=True)

def get_user_itemlist(matrix,user_id):
    seen_list = []
    seen_dict = {}
    unseen_list = []
    unseen_dict = {}
    for idx, item in enumerate(matrix[user_id]):
        if item != 0:
            seen_list.append([idx, item])
            seen_dict[idx] = item
        else:
            unseen_dict[idx] = item
            unseen_list.append(idx)
        seen_list.sort(key=lambda x: x[1], reverse=True)
    return seen_list,seen_dict,unseen_list,unseen_dict

def find_similar_item(item_corr,item_id):
    arg_, corr_ = np.argsort(item_corr[item_id])[::-1],np.sort(item_corr[item_id])
    return arg_[1:],np.sort(item_corr[item_id][1:])


@app.route("/recommend",methods=['GET', 'POST'])
def eval():
    user_id = int(request.args.get('user_id'))
    count = int(request.args.get('count'))

    result_list = []
    for idx,item in enumerate(recommend(user_id=user_id)):
        result_list.append(str(index_to_movie[item[0]]))
    return jsonify(result_list[:count])

def replace_non_alphabetic_chars_to_space(sentence):
    return re.sub('[-=.#/?:$,}]', '', sentence)

def matcher(str1,str2):
    a = SequenceMatcher(None, str1, str2)

    dismatching_arr = [i for i in range(len(str2))]

    for match in a.get_matching_blocks():
        for i in range(match.size):
            dismatching_arr.remove(match.b + i)

    return {"ratio": a.ratio(), "dismatch_idx": dismatching_arr}

@app.route("/match",methods=['GET', 'POST'])
def matches():

    if request.method == "GET":
        str1 = request.args.get('str1')
        str2 = request.args.get('str2')

    if request.method == "POST":
        str1 = request.form.get('str1')
        str2 = request.form.get('str2')

    str1 = replace_non_alphabetic_chars_to_space(str1).replace("  ", " ")
    str2 = replace_non_alphabetic_chars_to_space(str2).replace("  ", " ")

    a = SequenceMatcher(None, str1, str2)

    dismatching_arr = [i for i in range(len(str2))]

    for match in a.get_matching_blocks():
        for i in range(match.size):
            dismatching_arr.remove(match.b + i)

    result_dic = {"ratio" : a.ratio(),"dismatch_idx" : dismatching_arr}

    return jsonify(result_dic)

def connection_mongo(ip,port):
    return pymongo.MongoClient(ip,port)

def insert_db():
    conn = connection_mongo("localhost",27017)
    db = conn.recommend_db
    collection = db.recommend

    collection.insert({"number":0})


def read_db():
    conn = connection_mongo("localhost",27017)

    db = conn.get_database("test")
    collection = db.get_collection("favorite")

    results = collection.find()

    matrix = []

    for result in results:
        matrix.append([result["id"],result["isbn"],result["stars"]])

    item_corr = pearson_corr(matrix)
    print(matrix)
    return matrix ,item_corr

app.run(host='localhost', port=8000, debug=True)
