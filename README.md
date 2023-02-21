# Using Tabulator with Stimulus (and a little Chartkick thrown in for fun)

This is turning into a little series for me! I am loving moving things out of my html.erb files and into Stimulus controllers. It is cleaning things up and making things faster. If there was ever a win-win, this is it!

This time I am going back to Tabluator, which I admit to having a dev-crush on. It is a fast and full-featured library that is a breath of fresh air after more than a decade of hand-to-hand combat with Datatables.
To quote Klyden, from the Orville, I feel like I've been standing up my whole life and I just sat down.

Anyway, let's get on with it.

I am starting with my using Rails 7 Bootstrap starter app and actually carrying on from my previous Chartkick demo. Yes, I am using Bootstrap. If that is too 'granddad for you' then....shrug.
When I left off I had a table on the index page that was - shock, horror! - an actual table, with the data coming in at load time.

Replace the Table with Tabulator

So let's delete this:

```
  <div id='purchases' data-purchases-chart-target='purchases'>
    <table class='table table-striped table-sm mt-2'>
      <tbody>
        <% @purchases.each do |purchase|%>
          <%= render purchase %>
        <% end %>
      </tbody>
    </table>
  </div>
```

and replace it with:

```
  <div data-purchases-chart-target='table' class='table table-striped table-sm mt-2'></div>
```

We are setting a target value in our Stimulus controller. We will hook all this up in a minute.

All of this is going inside our existing div that exposes the Stimulus controller:

```
<div class='outside'
  data-controller='purchases-chart'
  data-purchases-chart-id-value='purchasesChart'
  data-purchases-chart-url-value='<%= purchases_data_purchases_path %>'>
// our stuff in here
</div>
```

### Add Tabulator

Before we get to far (I did things out of order in the video), let's install Tabulator on this branch:
yarn add tabulator-tables

In our app/javascription/application.js add this:
import {TabulatorFull as Tabulator} from 'tabulator-tables';
window.Tabulator = Tabulator; // make it available to our window

And in our app/assets/stylesheets/application.bootstrap.scss add this:
@import 'tabulator-tables/dist/css/tabulator_bootstrap5.min';

### Hook up to our div to Stimulus

Hooking up from a Stimulus controller to our Tabulator target is easy, and much like how you do without Stimulus

We are putting this code inside out purchases-chart controller so that later we can easily connect chartkick with tabulator again.

All of these edits happen inside app/javascript/controllers/purchases_chart_controller.js

1) Add the target

```
  static targets = ['purchases', 'table'] // we have purchases before, now add the table. We set this up on the div earlier
```

2) Create some values to to store our table and also the URL we will need later

```
  static values = {
    id: String,           // from chartkick demo
    dateFilter: String,   // from chartkick demo
    url: String,          // from chartkick demo
    datasource: String,   // <---- new, for our url
    tabulatorTable: Object // <---- new, store a reference to our table
  }
```

3) Create the Tabulator object
Inside the connect() add this:

```
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
        {title: "Quantity", field: "quantity"},
        {title: "Purchase Amount", field: "purchase_amount", formatter: "money", formatterParams: {precision: 2, symbol: "$"}},
        {title: "Purchased At", field: "purchased_at"},
        {title: "Status", field: "status"},
        {title: "Description", field: "description"}
      ]
    })
```

This will configure the Tabulator to pull the data and put it into those columns.

You should now be able to refresh the page and see the Tabulator footer at the bottom - we haven't given it the URL to load the data!

### Add the Ajax URL

We already had a `purchases/purchase_data` url from how we were loading the data in the chartkick demo. Let's keep using that URL.

1) See the URL in the Stimulus controller:
Up on the outmost div, let's add a value and pass in the URL to the controller

```
<div class='outside'
  data-controller='purchases-chart'
  data-purchases-chart-id-value='purchasesChart'
  data-purchases-chart-url-value='<%= purchases_data_purchases_path %>'
  data-purchases-chart-datasource-value='<%= purchases_data_purchases_path %>'> // we are adding this line. Don't forget to close the div!
```

2) Edit the RAILS Controller to handle the different request.

```
  def purchases_data
    @date_filter = params[:date_filter]

    @purchases = Purchase.all.order(purchased_at: :desc)
    if @date_filter.present?
      datetime = DateTime.parse(@date_filter)
      @purchases = @purchases.where(purchased_at: datetime.beginning_of_day..datetime.end_of_day)
    end

    respond_to do |format|
      format.html # for giggles leave this here for the old way
      format.json { render json: @purchases } # add this (requests from Tabulator are JSON requests)
    end
  end
```

Refreshing the page will now show you the table with data! Woo hoo!

## Inline Editing

Sometimes you might want to let the customer edit data. Let's quickly add some inline editing.

1) update the Table defition

```
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
```

Note the 'editor' (and editorParams) fields added to some columns.
If you refresh the page you will be able to click on those columns and edit the data. The `Status` field also loads it's values from the existing data in that column. How cool is that?!

### Save the data in Rails

But how do we save the data? Simple! Send it to rails

1) Capute the cellEdited event
When we are done editing a column Tabulator will fire the `cellEdited` event. So we just need to capture that event and act on it
Add this to the Stimulus controller after where we initialize the Tabulator object

```
    this.tabulatorTable.on("cellEdited", function(cell) {
      const data = cell.getRow().getData()
      console.log(data)
    })
```

Editing the data you'll see we write it out to console.

2) Send it Rails
We will use `fetch` to send a `PATCH` call to rails

```
    this.tabulatorTable.on("cellEdited", function(cell) {
      const data = cell.getRow().getData()
      console.log(data)

      const purchase_params = { purchase: data }

      fetch("/purchases/" + data.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getMetaValue("csrf-token") # see the video or source code for explanation
        },
        body: JSON.stringify(purchase_params)
      })
    })
```

NOTE: you need the CSRF token.

3) Write the Update method on the Rails controller
We didn't have an update method, so let's make one:

```
  def update
    @purchase = Purchase.find(params[:id])
    @purchase.update!(purchase_params)
  end

  private

  def purchase_params
    params.require(:purchase).permit(:quantity, :status, :description)
  end
```

Done!