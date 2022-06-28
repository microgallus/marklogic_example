#!python3

import requests
from requests.auth import HTTPDigestAuth
from requests_toolbelt.multipart import MultipartDecoder


auth = HTTPDigestAuth("pparsons", "password")
svr_url = "http://localhost:8020/LATEST"


def create_rest_api():
    crapi = b"""{ "rest-api": {
        "name": "webapp-rest",
        "database": "webapp",
        "modules-database": "webapp-modules",
        "port": "8090"
    } }
    """

    headers = {
        "Content-type": "application/json"
    }

    auth = HTTPDigestAuth("pparsons", "password")

    resp = requests.post("http://localhost:8002/LATEST/rest-apis",
                         data=crapi, auth=auth, headers=headers)
    print(
        f"response:{resp}\nreq: {resp.request.headers} \nresponse:\n{resp.content}")


def upload_doc():
    document = """<html><body><h1>Hello World</h1></body></html>"""

    uri = "/app/index.html"

    params = {
        "uri": uri
    }

    resp = requests.put(svr_url + "/documents", auth=auth,
                        data=document, params=params)
    print(
        f"response:{resp}\nreq: {resp.request.headers} \nresponse:\n{resp.content}")


def do_eval(js: str):
    uri = "/eval"

    post_data = {
        "javascript": js
    }

    resp = requests.post(svr_url + uri, auth=auth, data=post_data)
    print(f"RESPONSE:{resp}")
    ct = resp.headers.get('content-type')
    print(f"Content-Type: {ct}")
    if ct and ct.startswith("multipart/mixed"):
        mpart = MultipartDecoder.from_response(resp)
        print(f"response:{resp}\nreq: {resp.request.headers}\n")

        for part in mpart.parts:
            print(f"PART:\n{part.content}")
            yield part.content
    else:
        yield resp.content


def deploy_webapp_resource():
    uri = "/config/resources/webapp"

    js = b"""
    function get(context, params) {
        let scandir = '/Users/pparsons/temp/marklogic_examples/webapp/data'

        let manifest = xdmp.filesystemFile(scandir + '/manifest.xml')

        manifest = xdmp.unquote(manifest)

        let names= []

        for (let file of fn.head(manifest).xpath('//file')) {
        names.push(file.xpath('name/text()'))
        }

        let checksums = []
        for (let name of names) {
        let bin = xdmp.externalBinary(scandir + '/' + name)
        let md5 = xdmp.md5(bin)
        let tok = fn.tokenize(bin.toString(),"\\r\\n")
        checksums.push({filename: name, checksum: md5, row_count: fn.count(tok) })
        }
        context.outputTypes = ['application/json'];
        context.outputStatus = [200, 'OK'];
        return checksums
    };  

    exports.GET = get
    """

    headers = {
        "content-type": "application/javascript"
    }

    resp = requests.put(svr_url + uri, auth=auth, data=js, headers=headers)

    print(
        f"\nRESPONSE:{resp}\nREQUEST:\n {resp.request.headers}\n\nRESP BODY:\n{resp.content}\n")


def configure_server():

    server_name = "webapp"

    root = "/Users/pparsons/temp/marklogic_examples/webapp/dist"
    rewriter = "default_rewriter.xml"


    js = f"""
        const admin = require('/MarkLogic/admin.xqy');
        config = admin.getConfiguration()
        const default_gid = admin.groupGetId(config, "Default")
        const gid = admin.appserverGetId(config, default_gid, "{server_name}")

        config = admin.appserverSetUrlRewriter(config, gid, "{rewriter}")
        config = admin.appserverSetRoot(config, gid, "{root}" )

        admin.saveConfiguration(config)
    """

    for doc in do_eval(js):
        print(f"FOO {doc}")


configure_server()
#deploy_webapp_resource()

