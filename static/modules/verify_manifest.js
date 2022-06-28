var flatMap = require('array.prototype.flatmap');
const {TextEncoder, TextDecoder} = require("fastestsmallesttextencoderdecoder-encodeinto");
delete Array.prototype.flatMap;
var shimmedFlatMap = flatMap.shim();

const arrow = require('apache-arrow');
const { Utf8 } = require('apache-arrow');

let scandir = '/Users/pparsons/temp/marklogic_examples/webapp/data'

let manifest = xdmp.filesystemFile(scandir + '/manifest.xml')
manifest = xdmp.unquote(manifest)

let names= []

for (let file of fn.head(manifest).xpath('//file')) {
    names.push(file.xpath('name/text()'))
}
let filenames = new arrow.makeBuilder( {type: new arrow.Utf8(), nullValues: [null, 'n/a'] })
let checksums = new arrow.makeBuilder( {type: new arrow.Utf8(), nullValues: [null, 'n/a'] })
let row_counts = new arrow.makeBuilder( {type: new arrow.Uint16(), nullValues: [null, 'n/a'] })

for (let name of names) {
    let bin = xdmp.externalBinary(scandir + '/' + name)
    let md5 = xdmp.md5(bin)
    let tok = fn.tokenize(bin.toString(),"\\r\\n")

    filenames.append(name)
    checksums.append(md5)
    row_counts.append(fn.count(tok))
}

table = arrow.tableFromArrays({
    filename: filenames.finish().toVector(),
    checksum: checksums.finish().toVector(),
    row_count: row_counts.finish().toVector()
})

ipc_data = arrow.tableToIPC(table)

function toHex(bytes) {
    let result = []

    for (let byte of bytes) {
        result.push(byte.toString(16).padStart(2, '0'))
    }
    return result.join('')
}

const builder = new NodeBuilder();
builder.startDocument('data.arrow')
builder.addBinary(toHex(ipc_data));
builder.endDocument()
let node = builder.toNode()
return node