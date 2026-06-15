class Expense < ApplicationRecord
  belongs_to :category

  validate :date_cannot_be_in_future

  private

  def date_cannot_be_in_future
    return if date.blank?

    errors.add(
      :date,
      "cannot be in the future. Please select today or an earlier date."
    ) if date > Date.current
  end
end
