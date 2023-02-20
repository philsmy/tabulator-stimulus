# == Schema Information
#
# Table name: purchases
#
#  id              :integer          not null, primary key
#  item_name       :string
#  quantity        :integer
#  purchase_amount :float
#  purchased_at    :datetime
#  status          :string
#  customer_id     :integer          not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  description     :string
#
class Purchase < ApplicationRecord
  belongs_to :customer
end
