from rest_framework import serializers

class RoleSerializer(serializers.Serializer):
    userRole = serializers.CharField(max_length=100, required=True, error_messages={
        "required": "The user role is required.",
        "blank": "The user role cannot be empty."
    })
    status = serializers.ChoiceField(choices=['active', 'inactive'], required=True, error_messages={
        "required": "The status is required.",
        "invalid_choice": "Status must be 'active' or 'inactive'."
    })
    def validate(self, data):
        data['userRole'] = data.pop('userRole')
        return data
    
class LeaveSerializer(serializers.Serializer):
    leavetype = serializers.CharField(max_length=100, required=True, error_messages={
        "required": "Leave Type is required.",
        "blank": "Leave Type cannot be empty."
    })
    status = serializers.ChoiceField(choices=['active', 'inactive'], required=True, error_messages={
        "required": "The status is required.",
        "invalid_choice": "Status must be 'active' or 'inactive'."
    })
    def validate(self, data):
        data['leavetype'] = data.pop('leavetype')
        return data
    
class HolidaySerializer(serializers.Serializer):
    holiday = serializers.CharField(max_length=100, required=True, error_messages={
        "required": "Holiday is required.",
        "blank": "Holiday cannot be empty."
    })
    status = serializers.ChoiceField(choices=['active', 'inactive'], required=True, error_messages={
        "required": "The status is required.",
        "invalid_choice": "Status must be 'active' or 'inactive'."
    })
    def validate(self, data):
        data['holiday'] = data.pop('holiday')
        return data
