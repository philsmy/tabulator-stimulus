class PurchasesController < ApplicationController
  def index
    @purchases = Purchase.all
  end

  def purchases_data
    @date_filter = params[:date_filter]

    @purchases = Purchase.all.order(purchased_at: :desc)
    if @date_filter.present?
      datetime = DateTime.parse(@date_filter)
      @purchases = @purchases.where(purchased_at: datetime.beginning_of_day..datetime.end_of_day)
    end

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
