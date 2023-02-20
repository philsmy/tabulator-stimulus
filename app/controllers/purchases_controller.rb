class PurchasesController < ApplicationController
  def index
    @purchases = Purchase.all
  end

  def purchases_data
    @date_filter = params[:date_filter]

    datetime = DateTime.parse(@date_filter) if @date_filter.present?

    @purchases = Purchase.all.order(purchased_at: :desc)
    @purchases = @purchases.where(purchased_at: datetime.beginning_of_day..datetime.end_of_day) if @date_filter.present?

    respond_to do |format|
      format.html
      format.json { render json: @purchases }
    end
  end

  def update
    @purchase = Purchase.find(params[:id])
    @purchase.update!(purchase_params)
  end

  private

  def purchase_params
    params.require(:purchase).permit(:quantity, :status, :description)
  end
end
