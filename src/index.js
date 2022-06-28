import perspective from "@finos/perspective";

import "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";
import "@finos/perspective-viewer-d3fc/bar";

import "@finos/perspective-viewer/dist/css/material-dark.css";

import "./css/index.css";
import { tableFromIPC } from 'apache-arrow'

const worker = perspective.shared_worker();

const schema = {
    file: "string",
    checksum: "string",
    row_count: "number"
}

window.addEventListener("DOMContentLoaded", async () => {
    const viewer = document.createElement("perspective-viewer");
    document.body.append(viewer);

    let dataPath = "modules/verify_manifest.sjs"

    fetch(dataPath).then((response) => response.arrayBuffer()
        .then((data) => {
            console.log(data)
            let table = worker.table(data)
            viewer.load(table);
            window.viewer = viewer;
            window.appData = data
        })
    )
});