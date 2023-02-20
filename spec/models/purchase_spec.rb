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
require 'rails_helper'

RSpec.describe Purchase, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
