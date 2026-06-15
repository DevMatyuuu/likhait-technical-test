class Expense < ApplicationRecord
  belongs_to :category

  scope :ordered_by_latest, -> {
    order(date: :desc, created_at: :desc)
  }

  scope :by_month, ->(year, month) {
    start_date = Date.new(year, month, 1)
    end_date = start_date.end_of_month

    where(date: start_date.beginning_of_day..end_date.end_of_day)
  }
end
