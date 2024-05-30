import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../providers/user_provider.dart';

class AccountInfoPage extends StatefulWidget {
  const AccountInfoPage({super.key});

  @override
  State<AccountInfoPage> createState() => _AccountInfoPageState();
}

class _AccountInfoPageState extends State<AccountInfoPage> {
  bool _isEditing = false;
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final GlobalKey<FormState> _formPasswordKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmNewPasswordController = TextEditingController();
  final TextEditingController _oldPasswordController = TextEditingController();
  bool _isPasswordEditing = false;
  bool _isNewPasswordVisible = false;
  bool _isConfirmNewPasswordVisible = false;
  bool _isOldPasswordVisible = false;

  void _onLogoutPressed(BuildContext context) async {
    final provider = Provider.of<UserProvider>(context, listen: false);

    // Clear user data and remove user data from shared preferences
    provider.clearUser();
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.remove('userId');
    prefs.remove('userToken');

    // Navigate back to homepage
    Navigator.of(context).pop();
  }

  void _onInfoDonePressed() {
    if (_formKey.currentState!.validate()) {
      // Update user data
      final provider = Provider.of<UserProvider>(context, listen: false);

      if (_nameController.text != provider.getUserName()) {
        provider.setUserName(_nameController.text);
      }

      if (_emailController.text != provider.getUserEmail()) {
        provider.setUserEmail(_emailController.text);
      }

      setState(() {
        _isEditing = false;
      });
    }
  }

  void _onPasswordDonePressed() async {
    if (_formPasswordKey.currentState!.validate()) {
      // Update user password
      final provider = Provider.of<UserProvider>(context, listen: false);
      bool result;
      String error;
      (result, error) = await provider.setUserPassword(_newPasswordController.text, _oldPasswordController.text);

      if (!result) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
        return;
      }

      setState(() {
        _isPasswordEditing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UserProvider>(context, listen: false);

    _nameController.text = provider.getUserName();
    _emailController.text = provider.getUserEmail();

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
      appBar: AppBar(
        title: const Text('Il mio profilo'),
        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                // Icon and user's name
                Padding(
                  padding: const EdgeInsets.fromLTRB(0.0, 20.0, 0.0, 20.0),
                  child: Row(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primaryContainer,
                          borderRadius: const BorderRadius.all(Radius.circular(50)),
                        ),
                        child: const Padding(
                          padding: EdgeInsets.all(8.0),
                          child: Icon(
                            Icons.person,
                            size: 48,
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 8.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              provider.getUserName(),
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            Text(
                              '${provider.getUserPoints().toString()} punti',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Personal information section
                Row(
                  children: [
                    Text(
                      'I miei dati',
                      style: Theme.of(context).textTheme.titleLarge!.copyWith(
                            decoration: TextDecoration.underline,
                            fontSize: 24,
                          ),
                    ),
                    _isEditing
                        ? Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              IconButton.outlined(
                                icon: const Icon(Icons.done),
                                onPressed: () {
                                  _onInfoDonePressed();
                                },
                              ),
                              IconButton.outlined(
                                icon: const Icon(Icons.close),
                                onPressed: () {
                                  setState(() {
                                    _isEditing = false;
                                  });
                                },
                              ),
                            ],
                          )
                        : IconButton.outlined(
                            icon: const Icon(Icons.edit),
                            onPressed: () {
                              setState(() {
                                _isEditing = true;
                              });
                            },
                          ),
                  ],
                ),
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Nome e Cognome',
                        ),
                        controller: _nameController,
                        enabled: _isEditing,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Campo obbligatorio';
                          }
                          return null;
                        },
                      ),
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Email',
                        ),
                        controller: _emailController,
                        enabled: _isEditing,
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Campo obbligatorio';
                          }
                          if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                            return 'Email non valida';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),

                // Change password section
                Row(
                  children: [
                    Text(
                      'Cambia password',
                      style: Theme.of(context).textTheme.titleLarge!.copyWith(
                            decoration: TextDecoration.underline,
                            fontSize: 24,
                          ),
                    ),
                    _isPasswordEditing
                        ? Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              IconButton.outlined(
                                icon: const Icon(Icons.done),
                                onPressed: () {
                                  _onPasswordDonePressed();
                                },
                              ),
                              IconButton.outlined(
                                icon: const Icon(Icons.close),
                                onPressed: () {
                                  setState(() {
                                    _isPasswordEditing = false;
                                  });
                                },
                              ),
                            ],
                          )
                        : IconButton.outlined(
                            icon: const Icon(Icons.edit),
                            onPressed: () {
                              setState(() {
                                _isPasswordEditing = true;
                              });
                            },
                          ),
                  ],
                ),
                _isPasswordEditing
                    ? Form(
                        key: _formPasswordKey,
                        child: Column(
                          children: [
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Vecchia Password',
                                suffixIcon: IconButton(
                                  icon: Icon(_isOldPasswordVisible ? Icons.visibility : Icons.visibility_off),
                                  onPressed: () => setState(() => _isOldPasswordVisible = !_isOldPasswordVisible),
                                ),
                              ),
                              obscureText: !_isOldPasswordVisible,
                              controller: _oldPasswordController,
                              keyboardType: TextInputType.visiblePassword,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Campo obbligatorio';
                                }
                                if (value.length < 10) {
                                  return 'Almeno 10 caratteri';
                                }
                                return null;
                              },
                            ),
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Nuova Password',
                                suffixIcon: IconButton(
                                  icon: Icon(_isNewPasswordVisible ? Icons.visibility : Icons.visibility_off),
                                  onPressed: () => setState(() => _isNewPasswordVisible = !_isNewPasswordVisible),
                                ),
                              ),
                              obscureText: !_isNewPasswordVisible,
                              controller: _newPasswordController,
                              keyboardType: TextInputType.visiblePassword,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Campo obbligatorio';
                                }
                                if (value.length < 10) {
                                  return 'Almeno 10 caratteri';
                                }
                                return null;
                              },
                            ),
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Conferma nuova password',
                                suffixIcon: IconButton(
                                  icon: Icon(_isConfirmNewPasswordVisible ? Icons.visibility : Icons.visibility_off),
                                  onPressed: () => setState(() => _isConfirmNewPasswordVisible = !_isConfirmNewPasswordVisible),
                                ),
                              ),
                              obscureText: !_isConfirmNewPasswordVisible,
                              controller: _confirmNewPasswordController,
                              keyboardType: TextInputType.visiblePassword,
                              validator: (value) {
                                if (value == null || value.isEmpty || value != _newPasswordController.text) {
                                  return 'Le password non corrispondono';
                                }
                                return null;
                              },
                            ),
                          ],
                        ),
                      )
                    : const SizedBox(),

                // Logout button
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20.0),
                    child: ElevatedButton.icon(
                      onPressed: () => _onLogoutPressed(context),
                      icon: const Icon(Icons.logout),
                      label: const Text('Logout'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.error,
                        foregroundColor: Theme.of(context).colorScheme.onPrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
