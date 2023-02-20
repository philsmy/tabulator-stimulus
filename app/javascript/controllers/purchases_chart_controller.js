import { Controller } from "@hotwired/stimulus"
import { getMetaValue } from "./helper"


// Connects to data-controller="purchases-chart"
export default class extends Controller {
  static targets = ['purchases', 'table']
  static values = {
    id: String,
    dateFilter: String,
    url: String,
    datasource: String,
    tabulatorTable: Object
  }
  connect() {
    var chart = Chartkick.charts[this.idValue]

    let _this = this

    let chartConfig = chart.getChartObject().config
    chartConfig.options.onClick = function(event, native, active) {
      if (native.length > 0) {
        let xAxisIndex = native[0].index
        let label = chart.getChartObject().data.labels[xAxisIndex]

        _this.dateFilterValue = label
        _this.loadChart()
      }
    }

    this.tabulatorTable = new Tabulator(this.tableTarget, {
      layout: "fitDataFill",
      pagination: true,
      paginationSize: 25,
      paginationSizeSelector: true,
      dataSendParams: {
        "page": "start",
        "size": "length"
      },
      ajaxURL: this.datasourceValue,
      columns: [
        {title: "ID", field: "id", visible: false},
        {title: "Item Name", field: "item_name"},
        {title: "Quantity", field: "quantity", editor: "number"},
        {title: "Purchase Amount", field: "purchase_amount", formatter: "money", formatterParams: {precision: 2, symbol: "$"}},
        {title: "Purchased At", field: "purchased_at"},
        {title: "Status", field: "status", editor: "select", editorParams: {autocomplete: true, valuesLookup: true}},
        {title: "Description", field: "description", editor: "textarea"}
      ]
    })

    this.tabulatorTable.on("cellEdited", function(cell) {
      const data = cell.getRow().getData()
      console.log(data)

      const purchase_params = { purchase: data }

      fetch("/purchases/" + data.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getMetaValue("csrf-token")
        },
        body: JSON.stringify(purchase_params)
      })
    })
  }

  loadChart(event) {
    console.log(this.dateFilterValue)

    this.tabulatorTable.setData(this.datasourceValue, {date_filter: this.dateFilterValue})

    // fetch(this.urlValue + "?" + new URLSearchParams({date_filter: this.dateFilterValue}))
    //   .then(response => response.text())
    //   .then(html => {
    //     this.purchasesTarget.innerHTML = html
    //   })
  }
}
