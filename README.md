# Savvy #

Savvy is a location-based search engine for the prices of goods and services.

This was the Senior Design Project that myself, Colin McIntosh, Will Ashman, Eric Buck, Jordan Jobs, and Ryan Timken worked on at Drexel University for 9 months in 2015-2016. I worked on the UI along side Will Ashman. Colin McIntosh worked on the backend.
### Details ###

|               |                                            |
| ------------- | ------------------------------------------ |
| Version       | v1.0                                       |
| Source Code   | https://github.com/colinmcintosh/Savvy/    |

### Installation and Development###

This app is meant to be deployed using Microsoft Azure. A Microsoft Azure Web App should be configured with Python3.4
and configured to deploy this repository to the document root. For development purposes you can run a local copy of the
website by using the `runserver.py` file.

Using [virtualenv](https://virtualenv.pypa.io/en/stable/) is recommended but you can skip those steps and use your system-instance of Python instead and everything will be okay.

You must change the `config.py` to configure Savvy.

```shell
git clone https://github.com/colinmcintosh/Savvy.git
cd Savvy
virtualenv env && source env/bin/activate   # Optional -- Linux
$(virtualenv env) -and $(env/Scripts/activate.ps1)   # Optional -- Windows PowerShell
vim backend/config.py
pip install -r requirements.txt
python runserver.py
# Navigate to http://localhost:5555/
```

### Screenshots ###

![Homepage](/docs/screenshots/Savvy-homepage.png?raw=true "Savvy Homepage")


![Submit a Price](/docs/screenshots/Savvy-submitprice.png?raw=true "Savvy Submit a Price")


![FAQ](/docs/screenshots/Savvy-faq.png?raw=true "Savvy FAQ")


### HTTP API Examples ###

    Search for coffee:

    Client      ============================================>>>>    Server
            http://besavvy.xyz/api/v1/products/search?query=coffee

    Client      <<<<============================================    Server
            HTTP 200 OK:
            [
                {
                    product_id: 1235,
                    description: "Large Coffee",
                    tags: ["coffee", "drinks", "caffeine"]
                },
                {
                    product_id: 113,
                    description: "Jumbo Coffee",
                    tags: ["coffee", "drinks", "caffeine", "fat"]
                },
                {
                    product_id: 134,
                    description: "Large Decaf Coffee",
                    tags: ["coffee", "drinks", "caffeine"]
                },
                {
                    product_id: 2842,
                    description: "Decaf Coffee",
                    tags: ["coffee", "drinks", "caffeine"]
                },
                {
                    ...
                }
            ]
