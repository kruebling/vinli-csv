# Data Preprocessing

# Import Libraries
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

# Import Dataset
dataset = pd.read_csv('telemetry.csv')
x = dataset.iloc[:, 11].values
x = x.reshape(x.shape[0],-1)
y = dataset.iloc[:, 12].values
y = y.reshape(y.shape[0],-1)


# Taking care of missing data
from sklearn.preprocessing import Imputer
imputer = Imputer(missing_values = 'NaN', strategy = 'mean', axis = 0)
imputer = imputer.fit(x[:, 0:1])
x[:, 0:1] = imputer.transform(x[:, 0:1])
imputer = imputer.fit(y[:, 0:1])
y[:, 0:1] = imputer.transform(y[:, 0:1])

# Splitting data into Training set and Test set
from sklearn.cross_validation import train_test_split
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size = 0.2, random_state = 0)

# Fitting Simple Linear Regression to the Training set
from sklearn.linear_model import LinearRegression
regressor = LinearRegression()
regressor.fit(x_train, y_train)

# Predicting the Test set results
y_pred = regressor.predict(x_test)

# Visualising the Training set results
plt.scatter(x_train, y_train, color = 'red')
plt.plot(x_train, regressor.predict(x_train), color = 'blue')
plt.title('RPM vs MPH (Training Set)')
plt.xlabel('RPM')
plt.ylabel('MPH')
plt.show()

# Visualising the Test set results
plt.scatter(x_test, y_test, color = 'red')
plt.plot(x_train, regressor.predict(x_train), color = 'blue')
plt.title('RPM vs MPH (Test Set)')
plt.xlabel('RPM')
plt.ylabel('MPH')
plt.show()