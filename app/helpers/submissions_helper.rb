# frozen_string_literal: true

module SubmissionsHelper
  def acronym_from_submission_muted(submission)
    acronym =
      if submission.ontology.respond_to? :acronym
        submission.ontology.acronym
      else
        submission.ontology.split('/')[-1]
      end
    tag.small "for #{acronym}", class: 'text-muted'
  end

  def acronym_from_params_muted
    tag.small "for #{params[:ontology_id]}", class: 'text-muted'
  end

  def natural_language_selector(submission)
    options = Rails.application.config.language_codes.invert.sort
    selected = submission.naturalLanguage
    select(:submission, :naturalLanguage, options_for_select(options, selected),
           { include_blank: true },
           { multiple: true, class: 'form-select', 'aria-describedby': 'languageHelpBlock' })
  end
end
