# == Schema Information
#
# Table name: customers
#
#  id         :integer          not null, primary key
#  name       :string
#  status     :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Customer < ApplicationRecord
  has_many :purchases
  has_many :ordered_purchases, -> { order(purchased_at: :desc) }, class_name: "Purchase"
end
