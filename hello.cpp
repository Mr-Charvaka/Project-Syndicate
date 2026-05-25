#include <iostream>
#include <string>
#include <vector>

int main() {
    std::string name = "User";
    std::cout << "========================================" << std::endl;
    std::cout << "   Serene Logic C++ Runtime Test" << std::endl;
    std::cout << "========================================" << std::endl;
    
    std::cout << "Hello, " << name << "!" << std::endl;
    std::cout << "System initialized successfully." << std::endl;
    
    std::vector<std::string> modules = {"Terminal", "Debugger", "Auto-Save"};
    std::cout << "\nActive Modules:" << std::endl;
    for(const auto& module : modules) {
        std::cout << " - [ACTIVE] " << module << std::endl;
    }
    
    std::cout << "\nPress Enter to exit...";
    // std::cin.get(); 
    
    return 0;
}
