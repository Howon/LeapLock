import json
import math
from pprint import pprint
import serial

''' Read file to object '''
def readData(filename):
    with open(filename) as json_data:
        d = json.load(json_data)
    return d

def getPathLength(path):
    length = 0
    for i, point in enumerate(path):
        if i != 0:
            length += distance(path[i], path[i-1])
    return length

def distance(p1, p2):
    x_sq = math.pow(p2['x'] - p1['x'], 2) 
    y_sq = math.pow(p2['y'] - p1['y'], 2) 
    z_sq = math.pow(p2['z'] - p1['z'], 2) 
    sum = x_sq + y_sq + z_sq
    return math.sqrt(sum)
        

''' Given path of x, y, z return vector '''
def getVectors(path):
    vectors = []
    for i, point in enumerate(path):
        if i != 0:
            vector = {}
            vector['x'] = point['x'] - path[i - 1]['x']
            vector['y'] = point['y'] - path[i - 1]['y']
            vector['z'] = point['z'] - path[i - 1]['z']
            vectors.append(vector)
    return vectors

def dotProduct(vector1, vector2):
    product = 0
    for i in range(0, min(len(vector1), len(vector2))):
        x = vector1[i]['x'] * vector2[i]['x'] 
        y = vector1[i]['y'] * vector2[i]['y']
        z = vector1[i]['z'] * vector2[i]['z']
        product += x + y + z
    return product

def normalizeTime(oldPath):
    numPoints = 100 
    pathLength = getPathLength(oldPath)
    step = pathLength / float(numPoints + 60)
    
    oldPathIndex = 1
    newPath = []
    newPath.append(oldPath[0])
    for i in range(0, numPoints - 1):
        while(distance(newPath[i], oldPath[oldPathIndex]) < step):
            oldPathIndex += 1
        #    print distance(newPath[i], oldPath[oldPathIndex])
            if(oldPathIndex == len(oldPath)):
                break
        if(oldPathIndex == len(oldPath)):
            break

        newPath.append(oldPath[oldPathIndex])
        #print 'i', i
    return newPath 

def toUnit(vector):
    x_sq = math.pow(vector['x'], 2)
    y_sq = math.pow(vector['y'], 2)
    z_sq = math.pow(vector['z'], 2)
    length = math.sqrt(x_sq + y_sq + z_sq)
    unitVector = {}
    unitVector['x'] =  vector['x'] / length
    unitVector['y'] =  vector['y'] / length
    unitVector['z'] =  vector['z'] / length
    return unitVector

def normalizeVectors(vectors):
    normalizedVectors = []
    for vector in vectors:
        unitVector = toUnit(vector)
        normalizedVectors.append(unitVector)
    return normalizedVectors
    
def totalNormalize(path):
    tn_path = normalizeTime(path)
    tn_vec = getVectors(tn_path)
    normalized_vec = normalizeVectors(tn_vec)
    return normalized_vec

def getSimilarity(path1, path2):
    p1_norm = totalNormalize(path1)
    p2_norm = totalNormalize(path2)
    return dotProduct(p1_norm, p2_norm)

def isCorrect(path1, path2):
    ser = serial.Serial('/dev/tty.usbmodem1411', 9600)
    ser.close()
    ser.open()

    if(getSimilarity(path1, path2) > 45):
        ser.write('1')
        print 1
        return 1
    else:
        ser.write('0')
        print 0
        return 0

attempt = readData('../data/attempt.json')
attempt2 = readData('../data/attempt2.json')
lock = readData('../data/lock.json')
lock2 = readData('../data/lock2.json')
wrongLock = readData('../data/wrongLock.json')
wrongLock2 = readData('../data/wrongLock2.json')

print 'attempt, lock', getSimilarity(attempt, lock), isCorrect(attempt, lock)
print 'wrongLock, lock', getSimilarity(wrongLock, lock), isCorrect(wrongLock, lock)
print 'lock, lock', getSimilarity(lock, lock), isCorrect(lock, lock)
print 'attempt, attempt2', getSimilarity(attempt, attempt2), isCorrect(attempt, attempt2)
print 'lock2, attempt2', getSimilarity(lock2, attempt2), isCorrect(lock2, attempt2)
print 'wrongLock2, lock2', getSimilarity(wrongLock2, lock2), isCorrect(wrongLock2, lock2)
print 'lock2, lock2', getSimilarity(lock2, lock2), isCorrect(lock2, lock2)
