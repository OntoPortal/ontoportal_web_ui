# frozen_string_literal: true

class SearchInputComponent < ViewComponent::Base

  renders_one :template

  def initialize(name: '', placeholder: '', actions_links: {},
                 scroll_down: true, use_cache: true,
                 ajax_url:,
                 item_base_url:,
                 id_key:)
    super
    @name = name
    @placeholder = placeholder
    @actions_links = actions_links
    @use_cache = use_cache
    @scroll_down = scroll_down
    @ajax_url = ajax_url
    @item_base_url = item_base_url
    @id_key = id_key
  end
end
