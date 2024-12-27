from rest_framework import serializers

class RoleSerializer(serializers.Serializer):
    userrole = serializers.CharField(max_length=100, required=True, error_messages={
        "required": "The user role is required.",
        "blank": "The user role cannot be empty."
    })
    status = serializers.ChoiceField(choices=['active', 'inactive'], required=True, error_messages={
        "required": "The status is required.",
        "invalid_choice": "Status must be 'active' or 'inactive'."
    })

    # Map `userrole` to `userrole` internally
    def validate(self, data):
        data['userrole'] = data.pop('userrole')  # Rename userrole to userrole for internal use
        return data
