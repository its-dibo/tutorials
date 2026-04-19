#!/bin/sh

# create elasticsearch templates

echo "Waiting for Elasticsearch to start..."
until curl -s http://elasticsearch:9200/_cluster/health | grep -q '"status":"green"\|"status":"yellow"'; do
  echo "Elasticsearch is not ready yet..."
  sleep 5
done

echo "Elasticsearch is ready. Setting up index template..."


# a function to create an index template
create_template() {
  local templateName="$1"
  # an array of index patterns
  # example: '["pattern1", "pattern2"]'
  local indexPatterns="$2"
  local templateObj="$3"
  # if not provided, will be ignored
  local priority="$4"

  baseURL="http://elasticsearch:9200/_index_template"

  echo "> [setup] Creating template: $templateName..." 

  local payload="{
      \"index_patterns\": $indexPatterns,      
       ${priority:+\"priority\": $priority,}
       \"template\": $templateObj
    }"

   local response=$(
    curl -s -X PUT "$baseURL/$templateName" \
      -H "Content-Type: application/json" \
      -d "$payload"
  )   

  # check if the request success, if it responded with `{"acknowledged":true}`
  # or check if the template applied (but it may be created previously with different config)
  # `curl -X GET "$baseURL/$templateName"`
  if echo "$response" | grep -q '"acknowledged":true'; then 
    echo "> [setup] The template $templateName is created successfully"
  else
    echo "> [setup] Failed to create template $templateName"
    echo "> [setup] Response: $response"
  fi
}


create_dynamic_mapping() {
  local templateName="$1"
  local indexPatterns="$2"
  local dynamicMappingObj="$3"
  local priority="$4"

  create_template $templateName $indexPatterns "{
    \"mappings\": { \"dynamic_templates\": $dynamicMappingObj  }
  }" $priority
}


# use `priority: 0` to prevent this global template (i.e. matching index pattern "*") to override the more specific templates
# the pattern "*" matches all indices including the internal ones and may cause errors, so we prefixed it with "reports-*"
# to exclude a field from this mapping (i.e. keep it as a text instead of keyword) add it to `unmatch` or add another mapping object
# the first mapping object takes precedence
create_dynamic_mapping \
  "reports_template" \
  '["reports-*"]' \
  '[{
    "strings_as_text": {
     "match": "action",
     "mapping": { "type": "text"}
    }
   },
   {
    "strings_as_keywords": {
      "match_mapping_type": "string",
      "unmatch": ["*_text"],
      "mapping": { "type": "keyword" }
    }
  }]' \
  0

 echo "> [setup] Done"