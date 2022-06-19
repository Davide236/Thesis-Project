import unittest
import function_test as functions



#####
#https://stackoverflow.com/questions/46492209/how-to-emulate-data-from-a-serial-port-using-python-3-unittest-mocks
#https://docs.python.org/3/library/unittest.mock.html
# The test based on unittest module
class ScriptTest(unittest.TestCase):
    
    def test_get_user_answers(self):
        answers = functions.get_data('example-room')
        self.assertNotEqual(answers, [])
    
    def test_get_user_answers_wrong(self):
        answers = functions.get_data('example-room-5')
        self.assertEqual(answers, [])
        
    def test_find_student_answer(self):
        student_answers = [['student', '3'], ['student2', '5']]
        answer = functions.find_student_value('student', student_answers)
        self.assertEqual(answer, '3')
        
    def test_find_student_answer_wrong(self):
        student_answers = [['student', '3'], ['student2', '5']]
        answer = functions.find_student_value('student5', student_answers)
        self.assertEqual(answer, 0)
    
    def test_send_data(self):
        answer = functions.send_data('example-room')
        self.assertEqual(answer,1)

    
    def test_get_sensor_data(self):
        data = functions.get_sensor_value()
        self.assertEqual(5.0, data)
        
    
 
 
# Run the test
if __name__ == '__main__':
    unittest.main()
